import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Customer, Product } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import {
  FileSpreadsheet,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface ChallanLineItem {
  productId: string;
  quantity: number;
}

export const ChallanForm: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ChallanLineItem[]>([
    { productId: '', quantity: 1 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        setIsLoading(true);
        const [custRes, prodRes] = await Promise.all([
          api.get('/customers', { params: { limit: 100 } }),
          api.get('/products', { params: { limit: 100 } }),
        ]);

        if (custRes.data?.success) setCustomers(custRes.data.data);
        if (prodRes.data?.success) setProducts(prodRes.data.data);
      } catch (err: any) {
        showToast(err.message || 'Failed to initialize challan form', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadPrerequisites();
  }, []);

  const productMap = new Map(products.map((p) => [p.id, p]));

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      showToast('Challan must contain at least one line item', 'warning');
      return;
    }
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleItemChange = (index: number, field: keyof ChallanLineItem, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'quantity' ? Math.max(1, parseInt(value, 10) || 1) : value,
    };
    setItems(updated);
  };

  // Computed summary totals
  let totalQuantity = 0;
  let grandTotal = 0;

  for (const item of items) {
    const prod = productMap.get(item.productId);
    if (prod) {
      totalQuantity += item.quantity;
      grandTotal += Number(prod.unitPrice) * item.quantity;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      showToast('Please select a customer', 'error');
      return;
    }

    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      showToast('Please add at least one valid product SKU', 'error');
      return;
    }

    // Check for duplicate products
    const seen = new Set<string>();
    for (const item of validItems) {
      if (seen.has(item.productId)) {
        showToast('Please merge duplicate product line items into one row', 'error');
        return;
      }
      seen.add(item.productId);
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/challans', {
        customerId,
        notes: notes || undefined,
        items: validItems,
      });

      if (res.data?.success && res.data?.data) {
        showToast(`Draft Challan ${res.data.data.challanNumber} generated!`, 'success');
        navigate(`/challans/${res.data.data.id}`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create challan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/challans"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-brand-400" />
            Create New Sales Delivery Challan
          </h1>
          <p className="text-xs text-slate-400">
            Prepares a draft dispatch note with immutable product & pricing snapshots
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer & General Details */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            1. Consignee & Dispatch Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Select
                label="Select Customer / Buyer *"
                required
                options={customers.map((c) => ({
                  value: c.id,
                  label: `${c.customerName} (${c.businessName}) - ${c.customerType}`,
                }))}
                placeholder="-- Select Customer Account --"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div>
              <Input
                label="Dispatch / Transport Notes"
                placeholder="e.g. Transporter: VRL Logistics | Vehicle: MH-12-AB-1234"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Line Items */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Products & Quantities
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="border-slate-700 text-brand-400 hover:bg-slate-900"
            >
              + Add Product Row
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const selectedProd = productMap.get(item.productId);
              const unitPrice = selectedProd ? Number(selectedProd.unitPrice) : 0;
              const rowTotal = unitPrice * item.quantity;
              const currentStock = selectedProd ? selectedProd.currentStock : 0;
              const isStockInsufficient = selectedProd ? currentStock < item.quantity : false;

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  {/* Product selector */}
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Product SKU & Item #{idx + 1}
                    </label>
                    <Select
                      options={products.map((p) => ({
                        value: p.id,
                        label: `${p.productName} (${p.sku}) — Stock: ${p.currentStock}`,
                      }))}
                      placeholder="-- Choose Product --"
                      value={item.productId}
                      onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                      className="bg-slate-950 border-slate-700 text-white text-xs"
                    />
                  </div>

                  {/* Quantity input */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Quantity (Units)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="bg-slate-950 border-slate-700 text-white font-mono text-xs"
                    />
                  </div>

                  {/* Unit price & row total */}
                  <div className="sm:col-span-3">
                    <span className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Rate & Subtotal
                    </span>
                    <div className="text-xs">
                      <span className="text-slate-400 font-mono">@ ₹{unitPrice.toFixed(2)}</span>
                      <p className="font-mono font-bold text-emerald-400 text-sm">
                        = ₹{rowTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      {selectedProd && isStockInsufficient && (
                        <p className="text-[10px] text-amber-400 flex items-center gap-1 font-medium mt-0.5">
                          <AlertTriangle className="w-3 h-3" /> Exceeds stock ({currentStock})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Remove row button */}
                  <div className="sm:col-span-1 text-right sm:pt-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Remove Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grand Calculation Summary */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Note:</span> Saving as DRAFT does NOT reduce stock. Inventory will be atomically checked and deducted when confirmed.
            </div>

            <div className="text-right space-y-1">
              <div className="text-xs text-slate-400">
                Total Quantity:{' '}
                <span className="font-mono font-bold text-white text-sm">{totalQuantity}</span> units
              </div>
              <div className="text-base font-extrabold text-white">
                Grand Total:{' '}
                <span className="font-mono text-emerald-400 text-xl">
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link to="/challans">
            <Button variant="outline" type="button" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save as Draft Challan
          </Button>
        </div>
      </form>
    </div>
  );
};
