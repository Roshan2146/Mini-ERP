import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { Package, ArrowLeft, Save } from 'lucide-react';

const productFormSchema = z.object({
  productName: z.string().min(2, 'Product name is required'),
  sku: z.string().min(2, 'SKU is required'),
  category: z.string().min(2, 'Category is required'),
  unitPrice: z.coerce.number().min(0, 'Unit price must be positive or 0'),
  currentStock: z.coerce.number().int().min(0, 'Initial stock cannot be negative').optional(),
  minimumStock: z.coerce.number().int().min(0, 'Minimum stock threshold cannot be negative'),
  warehouseLocation: z.string().optional().or(z.literal('')),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      unitPrice: 0,
      currentStock: 0,
      minimumStock: 5,
    },
  });

  useEffect(() => {
    if (isEditMode) {
      api
        .get(`/products/${id}`)
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            const p = res.data.data;
            setValue('productName', p.productName);
            setValue('sku', p.sku);
            setValue('category', p.category);
            setValue('unitPrice', Number(p.unitPrice));
            setValue('minimumStock', p.minimumStock);
            setValue('warehouseLocation', p.warehouseLocation || '');
          }
        })
        .catch((err) => {
          showToast(err.message || 'Failed to load product', 'error');
          navigate('/products');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditMode]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      const payload = {
        ...data,
        sku: data.sku.toUpperCase(),
        warehouseLocation: data.warehouseLocation || undefined,
      };

      if (isEditMode) {
        // Exclude currentStock from direct edit to enforce transaction movements
        const { currentStock, ...editPayload } = payload;
        await api.put(`/products/${id}`, editPayload);
        showToast('Product SKU updated successfully', 'success');
      } else {
        await api.post('/products', payload);
        showToast('Product SKU added to catalog', 'success');
      }
      navigate('/products');
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/products"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-400" />
            {isEditMode ? 'Edit Product Master' : 'Create New Product SKU'}
          </h1>
          <p className="text-xs text-slate-400">Specify SKU identifiers, pricing, and reorder levels</p>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Input
                label="Product Descriptive Name *"
                placeholder="e.g. Industrial Digital Multimeter Pro"
                {...register('productName')}
                error={errors.productName?.message}
                className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <Input
                label="SKU Identifier Code *"
                placeholder="e.g. ELEC-DMM-001"
                {...register('sku')}
                error={errors.sku?.message}
                className="bg-slate-900 border-slate-700 text-white uppercase font-mono placeholder-slate-500"
              />
            </div>

            <div>
              <Input
                label="Product Category *"
                placeholder="e.g. Electronics, Packaging, Power Tools"
                {...register('category')}
                error={errors.category?.message}
                className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <Input
                label="Wholesale Unit Selling Price (₹) *"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('unitPrice')}
                error={errors.unitPrice?.message}
                className="bg-slate-900 border-slate-700 text-white font-mono placeholder-slate-500"
              />
            </div>

            {!isEditMode && (
              <div>
                <Input
                  label="Initial Stock Quantity (Units)"
                  type="number"
                  placeholder="0"
                  {...register('currentStock')}
                  error={errors.currentStock?.message}
                  className="bg-slate-900 border-slate-700 text-white font-mono placeholder-slate-500"
                />
              </div>
            )}

            <div>
              <Input
                label="Minimum Stock Threshold Alert *"
                type="number"
                placeholder="5"
                {...register('minimumStock')}
                error={errors.minimumStock?.message}
                className="bg-slate-900 border-slate-700 text-white font-mono placeholder-slate-500"
              />
            </div>

            <div>
              <Input
                label="Warehouse Storage Bin / Rack"
                placeholder="e.g. Aisle A, Rack 2, Bin 04"
                {...register('warehouseLocation')}
                error={errors.warehouseLocation?.message}
                className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Link to="/products">
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
              {isEditMode ? 'Update SKU' : 'Save Product SKU'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
