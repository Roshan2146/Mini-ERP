import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FollowUp } from '../../types';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { StatusBadge } from '../../components/common/Badge';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import {
  PhoneCall,
  Calendar,
  Building,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const FollowUpsPage: React.FC = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { showToast } = useToast();

  const fetchFollowUps = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (status) params.status = status;

      const res = await api.get('/customers/crm/all-followups', { params });
      if (res.data?.success) {
        setFollowUps(res.data.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load follow-ups', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [status]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <PhoneCall className="w-6 h-6 text-brand-400" />
            CRM Follow-up Pipeline & Schedule
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track lead engagements, scheduled distributor calls, and customer account milestones
          </p>
        </div>

        <div className="w-full sm:w-52">
          <Select
            options={[
              { value: 'PENDING', label: 'Pending Calls / Meetings' },
              { value: 'COMPLETED', label: 'Completed Follow-ups' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
            placeholder="All Follow-up Statuses"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-950 border-slate-800 text-white"
          />
        </div>
      </div>

      {/* Follow-up Cards Feed */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden p-6">
        {isLoading ? (
          <PageLoader />
        ) : followUps.length === 0 ? (
          <EmptyState
            title="No follow-up records found"
            description="You are caught up on all CRM follow-ups."
          />
        ) : (
          <div className="space-y-4">
            {followUps.map((f) => {
              const isOverdue =
                new Date(f.followUpDate).getTime() < Date.now() && f.status === 'PENDING';

              return (
                <div
                  key={f.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isOverdue
                      ? 'bg-rose-950/20 border-rose-800/60'
                      : f.status === 'COMPLETED'
                      ? 'bg-slate-900/50 border-slate-800/60 opacity-80'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <StatusBadge status={f.status} />
                      {isOverdue && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                          OVERDUE
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>Target Date: {new Date(f.followUpDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      Logged by {f.createdBy?.fullName || 'Sales'} • {new Date(f.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/customers/${f.customer?.id || f.customerId}`}
                          className="font-bold text-white hover:text-brand-400 text-sm"
                        >
                          {f.customer?.customerName}
                        </Link>
                        <span className="text-xs text-slate-400">({f.customer?.businessName})</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        "{f.notes}"
                      </p>
                    </div>

                    <Link
                      to={`/customers/${f.customer?.id || f.customerId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-brand-400 hover:text-brand-300 hover:bg-slate-700 text-xs font-semibold shrink-0 transition-colors"
                    >
                      Customer 360
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
