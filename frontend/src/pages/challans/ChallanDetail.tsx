import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { SalesChallan } from '../../types';
import { Button } from '../../components/common/Button';
import { StatusBadge, Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileSpreadsheet,
  ArrowLeft,
  Printer,
  CheckCircle,
  XCircle,
  Building,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';

export const ChallanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challan, setChallan] = useState<SalesChallan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Confirmation & Cancel Dialog States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { showToast } = useToast();
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const fetchChallan = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await api.get(`/challans/${id}`);
      if (res.data?.success) {
        setChallan(res.data.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load challan', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const handleConfirmChallan = async () => {
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const res = await api.post(`/challans/${id}/confirm`);

      if (res.data?.success) {
        showToast(res.data.message || 'Challan confirmed and stock deducted!', 'success');
        setIsConfirmOpen(false);
        fetchChallan();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Stock confirmation failed. Transaction was rolled back.');
      showToast(err.message || 'Stock confirmation rejected', 'error', 6000);
      setIsConfirmOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelChallan = async () => {
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const res = await api.post(`/challans/${id}/cancel`);

      if (res.data?.success) {
        showToast(res.data.message || 'Challan cancelled successfully', 'info');
        setIsCancelOpen(false);
        fetchChallan();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel challan', 'error');
      setIsCancelOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading || !challan) return <PageLoader />;

  const isDraft = challan.status === 'DRAFT';
  const isConfirmed = challan.status === 'CONFIRMED';
  const isCancelled = challan.status === 'CANCELLED';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link
            to="/challans"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight font-mono">
                {challan.challanNumber}
              </h1>
              <StatusBadge status={challan.status} />
            </div>
            <p className="text-xs text-slate-400">
              Created on {new Date(challan.createdAt).toLocaleDateString()} by{' '}
              {challan.createdBy?.fullName || 'Sales Executive'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Print Challan
          </Button>

          {isDraft && hasRole('ADMIN', 'SALES', 'WAREHOUSE') && (
            <Button
              variant="success"
              size="sm"
              onClick={() => setIsConfirmOpen(true)}
              leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
            >
              Confirm & Deduct Stock
            </Button>
          )}

          {!isCancelled && hasRole('ADMIN', 'SALES') && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsCancelOpen(true)}
              leftIcon={<XCircle className="w-3.5 h-3.5" />}
            >
              Cancel Challan
            </Button>
          )}
        </div>
      </div>

      {/* Error alert banner if stock validation failed */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs flex items-start gap-3 no-print shadow-lg">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-rose-300">Transaction Aborted (Database Rollback Verified)</h4>
            <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Printable Invoice / Challan Document Card */}
      <div className="p-8 sm:p-10 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl text-slate-100 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-slate-950">
                N
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">NexERP Wholesale</span>
            </div>
            <p className="text-xs text-slate-400">Industrial & Wholesale Logistics Division</p>
            <p className="text-xs text-slate-400">MIDC Industrial Area, Pune, MH 411026</p>
            <p className="text-xs text-slate-400 font-mono">GSTIN: 27AABCN8899K1Z4</p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="text-xs font-bold uppercase tracking-widest text-brand-400">
              COMMERCIAL DELIVERY CHALLAN
            </div>
            <h2 className="text-2xl font-black font-mono text-white">{challan.challanNumber}</h2>
            <div className="text-xs text-slate-400">
              Date: <span className="font-mono text-slate-200">{new Date(challan.createdAt).toLocaleDateString()}</span>
            </div>
            {challan.confirmedAt && (
              <div className="text-xs text-emerald-400 font-medium">
                Confirmed: {new Date(challan.confirmedAt).toLocaleString()}
              </div>
            )}
            {challan.cancelledAt && (
              <div className="text-xs text-rose-400 font-medium">
                Cancelled: {new Date(challan.cancelledAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Consignee Billing & Shipping Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              Consignee / Customer Details:
            </span>
            <h4 className="font-bold text-white text-sm">{challan.customer?.customerName}</h4>
            <p className="text-slate-300 font-semibold">{challan.customer?.businessName}</p>
            <p className="text-slate-400 leading-relaxed">{challan.customer?.address}</p>
            <div className="pt-1 flex items-center gap-4 text-slate-400 font-mono text-[11px]">
              <span>Phone: {challan.customer?.mobileNumber}</span>
              {challan.customer?.gstNumber && <span>GST: {challan.customer?.gstNumber}</span>}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              Dispatch & Transport Reference:
            </span>
            <p className="text-slate-300 leading-relaxed italic">
              {challan.notes ? `"${challan.notes}"` : 'Standard warehouse dispatch route.'}
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p>Generated By: {challan.createdBy?.fullName} ({challan.createdBy?.email})</p>
              <p>Status: <span className="font-semibold text-white">{challan.status}</span></p>
            </div>
          </div>
        </div>

        {/* Line Items Table (Using Snapshots) */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Itemized Goods & Snapshot Pricing
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-300 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">Description / Item Snapshot</th>
                  <th className="p-3.5">SKU Snapshot</th>
                  <th className="p-3.5 text-right">Quantity</th>
                  <th className="p-3.5 text-right">Unit Price</th>
                  <th className="p-3.5 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {challan.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-900/30">
                    <td className="p-3.5 font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-3.5 font-bold text-white">{item.productNameSnapshot}</td>
                    <td className="p-3.5 font-mono text-slate-400">{item.skuSnapshot}</td>
                    <td className="p-3.5 font-mono font-bold text-white text-right">
                      {item.quantity} units
                    </td>
                    <td className="p-3.5 font-mono text-right">
                      ₹{Number(item.unitPriceSnapshot).toFixed(2)}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400 text-right">
                      ₹{Number(item.totalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals & Signatures */}
        <div className="flex flex-col sm:flex-row items-end justify-between gap-6 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 max-w-sm space-y-1">
            <p className="font-semibold text-slate-300">Terms of Delivery:</p>
            <p>Goods received in sound condition. Subject to local jurisdiction. This is a computer generated delivery note.</p>
          </div>

          <div className="w-full sm:w-72 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Total Quantity:</span>
              <span className="font-mono font-bold text-white">{challan.totalQuantity} items</span>
            </div>
            <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
              <span>Net Valuation:</span>
              <span className="font-mono text-emerald-400">
                ₹{Number(challan.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Signature Line for Print */}
        <div className="pt-12 grid grid-cols-2 gap-8 text-xs text-slate-400">
          <div className="border-t border-slate-700 pt-2 text-center">
            Authorized Signatory (Warehouse / Dispatch)
          </div>
          <div className="border-t border-slate-700 pt-2 text-center">
            Receiver / Driver Signature & Date
          </div>
        </div>
      </div>

      {/* Confirmation Dialog with stock transaction warning */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmChallan}
        title="Confirm Challan & Deduct Stock"
        message={`Are you sure you want to CONFIRM challan ${challan.challanNumber}? The system will atomically check physical stock for all ${challan.items.length} line items. If any product is short, the transaction will rollback automatically.`}
        confirmText="Execute Stock Confirmation"
        variant="success"
        isLoading={actionLoading}
      />

      {/* Cancel Dialog */}
      <ConfirmDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleCancelChallan}
        title="Cancel Sales Challan"
        message={`Are you sure you want to cancel challan ${challan.challanNumber}? ${
          isConfirmed ? 'Because this challan was already confirmed, all deducted inventory will be safely RESTORED back into stock.' : ''
        }`}
        confirmText="Confirm Cancellation"
        variant="danger"
        isLoading={actionLoading}
      />
    </div>
  );
};
