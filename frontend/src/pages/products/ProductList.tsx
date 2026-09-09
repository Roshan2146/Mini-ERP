import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Product } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  Boxes,
  MapPin,
} from 'lucide-react';

export const ProductList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(searchParams.get('lowStockOnly') === 'true');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();
  const { hasRole } = useAuth();

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (lowStockOnly) params.lowStockOnly = true;

      const res = await api.get('/products', { params });
      if (res.data?.success) {
        setProducts(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(debounce);
  }, [search, category, lowStockOnly, page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/products/${deleteId}`);
      if (res.data?.success) {
        showToast('Product deleted from catalog', 'success');
        setDeleteId(null);
        fetchProducts();
      }
    } catch (err: any) {
      showToast(err.message || 'Cannot delete product', 'error');
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
            <Package className="w-6 h-6 text-brand-400" />
            Product Catalog & SKU Master
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage inventory items, SKU codes, pricing, categories, and minimum stock limits
          </p>
        </div>

        {hasRole('ADMIN', 'WAREHOUSE') && (
          <Link to="/products/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Add Product SKU
            </Button>
          </Link>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-md flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search products by SKU or product name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
            className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
          />
        </div>

        <div className="w-full md:w-56">
          <Select
            options={categories.map((c) => ({ value: c, label: c }))}
            placeholder="All Categories"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setLowStockOnly(!lowStockOnly);
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold border flex items-center gap-2 transition-colors ${
            lowStockOnly
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Low Stock Only
        </button>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
        {isLoading ? (
          <PageLoader />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Adjust your search criteria or add new items to the inventory master."
            action={
              hasRole('ADMIN', 'WAREHOUSE') ? (
                <Link to="/products/new">
                  <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Add New SKU
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
                    <th className="px-6 py-3.5">Product Name & SKU</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Unit Price</th>
                    <th className="px-6 py-3.5">Stock Level</th>
                    <th className="px-6 py-3.5">Min Threshold</th>
                    <th className="px-6 py-3.5">Warehouse Bin</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {products.map((p) => {
                    const isLow = p.currentStock <= p.minimumStock;
                    const isOut = p.currentStock === 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <Link to={`/products/${p.id}`} className="font-bold text-white hover:text-brand-400">
                            {p.productName}
                          </Link>
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400 mt-0.5">
                            <span>SKU: {p.sku}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <Badge variant="default">{p.category}</Badge>
                        </td>

                        <td className="px-6 py-4 font-semibold text-emerald-400">
                          ₹{Number(p.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-black text-sm ${
                                isOut ? 'text-rose-500' : isLow ? 'text-amber-400' : 'text-white'
                              }`}
                            >
                              {p.currentStock}
                            </span>
                            {isOut ? (
                              <Badge variant="danger" size="sm">
                                OUT OF STOCK
                              </Badge>
                            ) : isLow ? (
                              <Badge variant="warning" size="sm" dot>
                                LOW STOCK
                              </Badge>
                            ) : (
                              <Badge variant="success" size="sm">
                                In Stock
                              </Badge>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-400 font-mono">
                          {p.minimumStock} units
                        </td>

                        <td className="px-6 py-4 text-slate-400">
                          {p.warehouseLocation ? (
                            <div className="flex items-center gap-1 text-[11px]">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span>{p.warehouseLocation}</span>
                            </div>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/products/${p.id}`}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                              title="Product Ledger & Info"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            {hasRole('ADMIN', 'WAREHOUSE') && (
                              <Link
                                to={`/products/${p.id}/edit`}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-brand-400 hover:bg-slate-700 transition-colors"
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Link>
                            )}

                            {hasRole('ADMIN', 'WAREHOUSE') && (
                              <button
                                onClick={() => setDeleteId(p.id)}
                                className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product SKU"
        message="Are you sure you want to delete this product? You cannot delete products that have been referenced in past sales challans."
        confirmText="Confirm Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
