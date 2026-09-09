import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  AlertTriangle,
  Search,
  Package,
  Layers,
} from 'lucide-react';

export const InventoryOverview: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Stock Movement Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();
  const { hasRole } = useAuth();

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/inventory');
      if (res.data?.success) {
        setSummary(res.data.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch inventory overview', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenStockModal = (type: 'IN' | 'OUT', prodId: string = '') => {
    setMovementType(type);
    setSelectedProductId(prodId || (summary?.items?.[0]?.id || ''));
    setQuantity('');
    setReason(type === 'IN' ? 'PURCHASE_RESTOCK' : 'DISPATCH_OR_DEFECT');
    setIsModalOpen(true);
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !quantity || parseInt(quantity, 10) <= 0) {
      showToast('Please select a valid product and positive quantity', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const endpoint = movementType === 'IN' ? '/inventory/stock-in' : '/inventory/stock-out';
      const res = await api.post(endpoint, {
        productId: selectedProductId,
        quantity: parseInt(quantity, 10),
        reason,
      });

      if (res.data?.success) {
        showToast(res.data.message || 'Stock updated successfully', 'success');
        setIsModalOpen(false);
        fetchInventory();
      }
    } catch (err: any) {
      showToast(err.message || 'Stock transaction failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !summary) return <PageLoader />;

  const filteredItems = summary.items.filter((item: any) =>
    item.productName.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-brand-400" />
            Inventory Control & Operations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Live stock balances, warehouse valuations, and immediate stock adjustments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/inventory/movements">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<History className="w-4 h-4" />}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Movement History
            </Button>
          </Link>

          {hasRole('ADMIN', 'WAREHOUSE') && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleOpenStockModal('IN')}
                leftIcon={<ArrowDownLeft className="w-4 h-4" />}
              >
                + Stock IN (Restock)
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleOpenStockModal('OUT')}
                leftIcon={<ArrowUpRight className="w-4 h-4" />}
              >
                - Stock OUT (Dispatch)
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Inventory Units</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {summary.totalInventoryQuantity.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">pieces</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across {summary.totalProducts} registered SKUs</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Stock Valuation</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-brand-400">
              ₹{Number(summary.totalValuation).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total wholesale asset value</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase">Low Stock SKUs</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{summary.lowStockCount}</span>
            <span className="text-xs text-slate-400">at reorder limit</span>
          </div>
          <p className="text-[11px] text-amber-400/80 mt-1">Requires immediate replenishment</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase">Out of Stock SKUs</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-500">{summary.outOfStockCount}</span>
            <span className="text-xs text-slate-400">0 quantity</span>
          </div>
          <p className="text-[11px] text-rose-400/80 mt-1">Order fulfilment blocked</p>
        </div>
      </div>

      {/* Stock Items Ledger Table */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-400" />
            Stock Master Ledger
          </h3>
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search product, SKU or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3">Product & SKU</th>
                <th className="p-3">Category</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Safety Min</th>
                <th className="p-3">Unit Valuation</th>
                <th className="p-3">Total Value</th>
                {hasRole('ADMIN', 'WAREHOUSE') && <th className="p-3 text-right">Quick Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredItems.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-900/40">
                  <td className="p-3">
                    <Link to={`/products/${item.id}`} className="font-bold text-white hover:text-brand-400">
                      {item.productName}
                    </Link>
                    <p className="font-mono text-[10px] text-slate-400">{item.sku}</p>
                  </td>

                  <td className="p-3">
                    <Badge variant="default">{item.category}</Badge>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold text-sm ${
                          item.isOutOfStock
                            ? 'text-rose-500'
                            : item.isLowStock
                            ? 'text-amber-400'
                            : 'text-white'
                        }`}
                      >
                        {item.currentStock}
                      </span>
                      {item.isOutOfStock ? (
                        <Badge variant="danger" size="sm">
                          0 Stock
                        </Badge>
                      ) : item.isLowStock ? (
                        <Badge variant="warning" size="sm" dot>
                          Low
                        </Badge>
                      ) : null}
                    </div>
                  </td>

                  <td className="p-3 font-mono text-slate-400">{item.minimumStock}</td>

                  <td className="p-3 font-mono">₹{Number(item.unitPrice).toFixed(2)}</td>

                  <td className="p-3 font-mono font-semibold text-emerald-400">
                    ₹{(item.currentStock * Number(item.unitPrice)).toLocaleString('en-IN')}
                  </td>

                  {hasRole('ADMIN', 'WAREHOUSE') && (
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenStockModal('IN', item.id)}
                          className="px-2 py-1 rounded bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-800/40 text-[11px] font-semibold"
                          title="Restock IN"
                        >
                          + IN
                        </button>
                        <button
                          onClick={() => handleOpenStockModal('OUT', item.id)}
                          disabled={item.currentStock === 0}
                          className="px-2 py-1 rounded bg-rose-950/40 text-rose-400 hover:bg-rose-900/50 border border-rose-800/40 text-[11px] font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Dispatch OUT"
                        >
                          - OUT
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock IN / Stock OUT Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={movementType === 'IN' ? 'Stock IN (Purchase Restock)' : 'Stock OUT (Dispatch / Adjustment)'}
      >
        <form onSubmit={handleStockSubmit} className="space-y-4">
          <div>
            <Select
              label="Select Product SKU *"
              options={summary.items.map((i: any) => ({
                value: i.id,
                label: `${i.productName} (${i.sku}) - Current Stock: ${i.currentStock}`,
              }))}
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <div>
            <Input
              label="Quantity to Move (Units) *"
              type="number"
              min="1"
              required
              placeholder="e.g. 20"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white font-mono"
            />
            {movementType === 'OUT' && (
              <p className="text-[11px] text-amber-400 mt-1">
                ⚠️ Stock cannot become negative. The transaction will reject any quantity exceeding available stock.
              </p>
            )}
          </div>

          <div>
            <Input
              label="Movement Operational Reason *"
              required
              placeholder={movementType === 'IN' ? 'e.g. Vendor Shipment PO #450' : 'e.g. Manual Dispatch or Sample test'}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              variant={movementType === 'IN' ? 'success' : 'danger'}
              type="submit"
              isLoading={isSubmitting}
            >
              Execute {movementType === 'IN' ? 'Stock IN' : 'Stock OUT'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
