import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Customer, FollowUp, SalesChallan } from '../../types';
import { Button } from '../../components/common/Button';
import { StatusBadge, Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  ArrowLeft,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileSpreadsheet,
  Plus,
  Clock,
  CheckCircle,
  FileText,
  Edit2,
} from 'lucide-react';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Follow-up modal state
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpStatus, setFollowUpStatus] = useState<'PENDING' | 'COMPLETED' | 'CANCELLED'>('PENDING');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();
  const { hasRole } = useAuth();

  const fetchCustomerDetails = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/customers/${id}`);
      if (res.data?.success && res.data?.data) {
        const c = res.data.data;
        setCustomer(c);
        setFollowUps(c.followUps || []);
        setChallans(c.challans || []);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch customer details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpNotes || !followUpDate) {
      showToast('Please provide both follow-up notes and date', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post(`/customers/${id}/followups`, {
        notes: followUpNotes,
        followUpDate: new Date(followUpDate).toISOString(),
        status: followUpStatus,
      });

      if (res.data?.success) {
        showToast('Follow-up record added to CRM', 'success');
        setIsFollowUpModalOpen(false);
        setFollowUpNotes('');
        setFollowUpDate('');
        fetchCustomerDetails();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add follow-up', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !customer) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/customers"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{customer.customerName}</h1>
              <StatusBadge status={customer.status} />
              <Badge variant="purple">{customer.customerType}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              {customer.businessName} {customer.gstNumber ? `• GST: ${customer.gstNumber}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {hasRole('ADMIN', 'SALES') && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFollowUpModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Log Follow-up
              </Button>
              <Link to={`/customers/${id}/edit`}>
                <Button variant="secondary" size="sm" leftIcon={<Edit2 className="w-3.5 h-3.5" />}>
                  Edit Profile
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Profile Overview & Contact Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            Contact & Commercial Details
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500">Phone / Mobile</span>
              <p className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-brand-400" />
                {customer.mobileNumber}
              </p>
            </div>

            <div>
              <span className="text-slate-500">Email Address</span>
              <p className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                {customer.email || 'None registered'}
              </p>
            </div>

            <div>
              <span className="text-slate-500">Registered Address</span>
              <p className="text-slate-300 flex items-start gap-1.5 mt-0.5 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                {customer.address}
              </p>
            </div>

            {customer.notes && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-500">Internal Account Notes</span>
                <p className="text-slate-300 italic mt-0.5 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  "{customer.notes}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CRM Follow-up Timeline */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              CRM Follow-up Timeline & Notes ({followUps.length})
            </h3>
            {hasRole('ADMIN', 'SALES') && (
              <button
                onClick={() => setIsFollowUpModalOpen(true)}
                className="text-xs text-brand-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                + Add Note
              </button>
            )}
          </div>

          {followUps.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No CRM follow-up activity logged yet. Click "Log Follow-up" to schedule calls or record client interaction notes.
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {followUps.map((f) => (
                <div key={f.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={f.status} />
                      <span className="text-xs font-mono text-slate-400">
                        Follow-up: {new Date(f.followUpDate).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Logged by {f.createdBy?.fullName || 'Sales'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{f.notes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Associated Sales Challans */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-purple-400" />
            Dispatch Challans History ({challans.length})
          </h3>
          {hasRole('ADMIN', 'SALES') && (
            <Link to="/challans/new" className="text-xs text-brand-400 hover:underline">
              + New Challan
            </Link>
          )}
        </div>

        {challans.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No sales challans recorded for this customer yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Challan #</th>
                  <th className="p-3">Total Quantity</th>
                  <th className="p-3">Total Valuation</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created Date</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {challans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-mono font-bold text-white">{ch.challanNumber}</td>
                    <td className="p-3">{ch.totalQuantity} items</td>
                    <td className="p-3 font-semibold text-emerald-400">
                      ₹{Number(ch.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={ch.status} />
                    </td>
                    <td className="p-3">{new Date(ch.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/challans/${ch.id}`}
                        className="text-brand-400 hover:underline font-semibold"
                      >
                        View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Follow-up Modal */}
      <Modal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        title="Record CRM Follow-up Note"
      >
        <form onSubmit={handleAddFollowUp} className="space-y-4">
          <div>
            <Input
              label="Next Follow-up Target Date *"
              type="date"
              required
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <div>
            <Select
              label="Follow-up Status *"
              options={[
                { value: 'PENDING', label: 'Pending / Scheduled' },
                { value: 'COMPLETED', label: 'Completed Call/Meeting' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
              value={followUpStatus}
              onChange={(e) => setFollowUpStatus(e.target.value as any)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Follow-up Conversation Notes & Outcomes *
            </label>
            <textarea
              rows={4}
              required
              value={followUpNotes}
              onChange={(e) => setFollowUpNotes(e.target.value)}
              placeholder="e.g. Discussed pricing slab for bulk orders. Customer confirmed they will order 50 units next week..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 text-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsFollowUpModalOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Save Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
