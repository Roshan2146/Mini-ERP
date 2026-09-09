import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { SalesChallan } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { StatusBadge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Eye,
  Building,
  UserCheck,
} from 'lucide-react';

export const ChallanList: React.FC = () => {
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const { showToast } = useToast();
  const { hasRole } = useAuth();

  const fetchChallans = async () => {
    try {
      setIsLoading(true);
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;

      const res = await api.get('/challans', { params });
      if (res.data?.success) {
        setChallans(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load sales challans', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchChallans();
    }, 250);
    return () => clearTimeout(debounce);
  }, [search, status, page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-brand-400" />
            Sales Challans & Dispatch Notes
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate draft delivery notes, confirm inventory deductions, and issue commercial invoices
          </p>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <Link to="/challans/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Create New Challan
            </Button>
          </Link>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-md flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by challan #, customer name, or business..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
            className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
          />
        </div>

        <div className="w-full md:w-52">
          <Select
            options={[
              { value: 'DRAFT', label: 'Draft Challans' },
              { value: 'CONFIRMED', label: 'Confirmed (Dispatched)' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
            placeholder="All Challan Statuses"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>
      </div>

      {/* Challans Table */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
        {isLoading ? (
          <PageLoader />
        ) : challans.length === 0 ? (
          <EmptyState
            title="No sales challans found"
            description="Adjust your search criteria or create a new delivery challan."
            action={
              hasRole('ADMIN', 'SALES') ? (
                <Link to="/challans/new">
                  <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Create Challan
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
                    <th className="px-6 py-3.5">Challan Number</th>
                    <th className="px-6 py-3.5">Customer / Company</th>
                    <th className="px-6 py-3.5">Items & Qty</th>
                    <th className="px-6 py-3.5">Total Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Generated Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {challans.map((ch) => (
                    <tr key={ch.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-white">
                        <Link to={`/challans/${ch.id}`} className="hover:text-brand-400">
                          {ch.challanNumber}
                        </Link>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-white">{ch.customer?.customerName}</span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Building className="w-3 h-3 text-slate-500" />
                          <span>{ch.customer?.businessName}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-200">{ch.totalQuantity} total units</span>
                        <p className="text-[10px] text-slate-500">
                          {ch.items?.length || 0} unique line items
                        </p>
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-emerald-400 text-sm">
                        ₹{Number(ch.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={ch.status} />
                      </td>

                      <td className="px-6 py-4 text-slate-400 font-mono">
                        {new Date(ch.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/challans/${ch.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </Link>
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
              onPageChange={(pg) => setPage(pg)}
            />
          </>
        )}
      </div>
    </div>
  );
};
