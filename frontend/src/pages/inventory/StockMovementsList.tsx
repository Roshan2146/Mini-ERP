import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StockMovement } from '../../types';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import {
  History,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Filter,
} from 'lucide-react';

export const StockMovementsList: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [movementType, setMovementType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  const { showToast } = useToast();

  const fetchMovements = async () => {
    try {
      setIsLoading(true);
      const params: any = { page, limit: 15 };
      if (movementType) params.movementType = movementType;

      const res = await api.get('/inventory/movements', { params });
      if (res.data?.success) {
        setMovements(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load stock movements', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [movementType, page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/inventory"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <History className="w-6 h-6 text-brand-400" />
              Stock Movement Audit Ledger
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable journal of all inventory restocks, challan dispatches, and warehouse adjustments
            </p>
          </div>
        </div>

        <div className="w-full sm:w-48">
          <Select
            options={[
              { value: 'IN', label: 'Stock IN (Restock)' },
              { value: 'OUT', label: 'Stock OUT (Dispatched)' },
            ]}
            placeholder="All Movement Types"
            value={movementType}
            onChange={(e) => {
              setMovementType(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border-slate-800 text-white"
          />
        </div>
      </div>

      {/* Movements Table */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
        {isLoading ? (
          <PageLoader />
        ) : movements.length === 0 ? (
          <EmptyState
            title="No movements recorded"
            description="No inventory entries match your selected criteria."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Product & SKU</th>
                    <th className="px-6 py-3.5">Quantity Moved</th>
                    <th className="px-6 py-3.5">Audit Reason / Ref</th>
                    <th className="px-6 py-3.5">Executed By</th>
                    <th className="px-6 py-3.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <Badge variant={m.movementType === 'IN' ? 'success' : 'danger'}>
                          {m.movementType === 'IN' ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-rose-400 inline mr-1" />
                          )}
                          {m.movementType}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        <Link
                          to={`/products/${m.product?.id || m.productId}`}
                          className="font-bold text-white hover:text-brand-400"
                        >
                          {m.product?.productName || 'Product SKU'}
                        </Link>
                        <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                          SKU: {m.product?.sku}
                        </p>
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-sm text-white">
                        {m.movementType === 'IN' ? '+' : '-'}
                        {m.quantity} units
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono text-slate-200">{m.reason}</span>
                        {m.referenceId && (
                          <p className="text-[10px] text-slate-500 font-mono">Ref: {m.referenceId}</p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {m.createdBy?.fullName || 'System Automated'}
                      </td>

                      <td className="px-6 py-4 text-right text-slate-400 font-mono">
                        {new Date(m.createdAt).toLocaleString()}
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
    </div>
  );
};
