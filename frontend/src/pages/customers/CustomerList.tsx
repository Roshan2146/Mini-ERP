import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Customer } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { StatusBadge, Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Building,
  Calendar,
} from 'lucide-react';

export const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();
  const { hasRole } = useAuth();

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (customerType) params.customerType = customerType;
      if (status) params.status = status;

      const res = await api.get('/customers', { params });
      if (res.data?.success) {
        setCustomers(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch customers', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchCustomers();
    }, 250);
    return () => clearTimeout(debounce);
  }, [search, customerType, status, page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/customers/${deleteId}`);
      if (res.data?.success) {
        showToast(res.data.message || 'Customer deleted successfully', 'success');
        setDeleteId(null);
        fetchCustomers();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete customer', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-brand-400" />
            Customer & CRM Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage client accounts, wholesale buyers, follow-ups, and lead pipelines
          </p>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <Link to="/customers/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Add Customer
            </Button>
          </Link>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-md flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by customer name, company, phone, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
            className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
          />
        </div>

        <div className="w-full md:w-48">
          <Select
            options={[
              { value: 'RETAIL', label: 'Retail' },
              { value: 'WHOLESALE', label: 'Wholesale' },
              { value: 'DISTRIBUTOR', label: 'Distributor' },
            ]}
            placeholder="All Client Types"
            value={customerType}
            onChange={(e) => {
              setCustomerType(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>

        <div className="w-full md:w-44">
          <Select
            options={[
              { value: 'LEAD', label: 'Lead' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
            placeholder="All Statuses"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
        {isLoading ? (
          <PageLoader />
        ) : customers.length === 0 ? (
          <EmptyState
            title="No customers found"
            description="Try changing your search filters or create a new customer."
            action={
              hasRole('ADMIN', 'SALES') ? (
                <Link to="/customers/new">
                  <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Add New Customer
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">Customer & Business</th>
                    <th className="px-6 py-3.5">Contact Details</th>
                    <th className="px-6 py-3.5">Type & GST</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Next Follow-up</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/customers/${c.id}`} className="font-bold text-white hover:text-brand-400">
                          {c.customerName}
                        </Link>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                          <Building className="w-3 h-3 text-slate-500" />
                          <span>{c.businessName}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{c.mobileNumber}</span>
                        </div>
                        {c.email && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span>{c.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={c.customerType} />
                        {c.gstNumber && (
                          <p className="text-[10px] font-mono text-slate-400 mt-1">
                            GST: {c.gstNumber}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>

                      <td className="px-6 py-4">
                        {c.followUpDate ? (
                          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(c.followUpDate).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/customers/${c.id}`}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                            title="View Customer 360"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {hasRole('ADMIN', 'SALES') && (
                            <Link
                              to={`/customers/${c.id}/edit`}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-brand-400 hover:bg-slate-700 transition-colors"
                              title="Edit Customer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                          )}

                          {hasRole('ADMIN', 'SALES') && (
                            <button
                              onClick={() => setDeleteId(c.id)}
                              className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                              title="Delete Customer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              pageSize={pagination.limit}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Customer Account"
        message="Are you sure you want to delete this customer? If the customer has linked sales challans, they will be marked as INACTIVE to preserve accounting and dispatch history."
        confirmText="Confirm Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
