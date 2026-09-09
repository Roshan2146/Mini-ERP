import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Product, StockMovement } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  ArrowLeft,
  Boxes,
  MapPin,
  Tag,
  AlertTriangle,
  History,
  Edit2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { showToast } = useToast();
  const { hasRole } = useAuth();

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/products/${id}`);
      if (res.data?.success) {
        setProduct(res.data.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load product details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (isLoading || !product) return <PageLoader />;

  const isLowStock = product.currentStock <= product.minimumStock;
  const isOutOfStock = product.currentStock === 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{product.productName}</h1>
              <Badge variant="purple">{product.category}</Badge>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {product.sku}</p>
          </div>
        </div>

        {hasRole('ADMIN', 'WAREHOUSE') && (
          <Link to={`/products/${id}/edit`}>
            <Button variant="secondary" size="sm" leftIcon={<Edit2 className="w-3.5 h-3.5" />}>
              Edit Product Info
            </Button>
          </Link>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase">Current Physical Stock</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-3xl font-black ${
                isOutOfStock ? 'text-rose-500' : isLowStock ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {product.currentStock}
            </span>
            <span className="text-xs text-slate-400">units</span>
          </div>
          {isLowStock && (
            <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" /> Below safety limit ({product.minimumStock})
            </div>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase">Unit Selling Price</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              ₹{Number(product.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Wholesale rate per piece</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase">Stock Valuation</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-brand-400">
              ₹{(product.currentStock * Number(product.unitPrice)).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total physical value</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase">Storage Location</span>
          <div className="mt-2 flex items-center gap-1.5 text-white font-semibold text-sm">
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>{product.warehouseLocation || 'Default Warehouse Floor'}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Safety alert at: {product.minimumStock} units</p>
        </div>
      </div>

      {/* Stock Movement History for this product */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <History className="w-4 h-4 text-brand-400" />
            Stock Ledger & Audit Movements for {product.sku}
          </h3>
          <Link to="/inventory/movements" className="text-xs text-brand-400 hover:underline">
            All Company Movements &rarr;
          </Link>
        </div>

        {(!product.stockMovements || product.stockMovements.length === 0) ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No stock movements logged for this SKU yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Type</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Movement Reason</th>
                  <th className="p-3">Logged By</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {product.stockMovements.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-900/40">
                    <td className="p-3">
                      <Badge variant={m.movementType === 'IN' ? 'success' : 'danger'}>
                        {m.movementType === 'IN' ? (
                          <TrendingUp className="w-3 h-3 text-emerald-400 inline mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-rose-400 inline mr-1" />
                        )}
                        {m.movementType}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono font-bold text-white">{m.quantity} units</td>
                    <td className="p-3 text-slate-300">{m.reason}</td>
                    <td className="p-3 text-slate-400">{m.createdBy?.fullName || 'System'}</td>
                    <td className="p-3 text-slate-500">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
