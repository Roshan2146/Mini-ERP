import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Card } from '../../components/common/Card';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { Users, ArrowLeft, Save } from 'lucide-react';

const customerFormSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  businessName: z.string().min(2, 'Business/Company name is required'),
  mobileNumber: z.string().min(7, 'Valid mobile number required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  gstNumber: z.string().optional().or(z.literal('')),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  address: z.string().min(3, 'Address is required'),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']),
  followUpDate: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

export const CustomerForm: React.FC = () => {
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
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customerType: 'WHOLESALE',
      status: 'LEAD',
    },
  });

  useEffect(() => {
    if (isEditMode) {
      api
        .get(`/customers/${id}`)
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            const c = res.data.data;
            setValue('customerName', c.customerName);
            setValue('businessName', c.businessName);
            setValue('mobileNumber', c.mobileNumber);
            setValue('email', c.email || '');
            setValue('gstNumber', c.gstNumber || '');
            setValue('customerType', c.customerType);
            setValue('address', c.address);
            setValue('status', c.status);
            setValue('notes', c.notes || '');
            if (c.followUpDate) {
              setValue('followUpDate', new Date(c.followUpDate).toISOString().split('T')[0]);
            }
          }
        })
        .catch((err) => {
          showToast(err.message || 'Failed to load customer details', 'error');
          navigate('/customers');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditMode]);

  const onSubmit = async (data: CustomerFormData) => {
    try {
      const payload = {
        ...data,
        email: data.email || undefined,
        gstNumber: data.gstNumber || undefined,
        followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString() : undefined,
        notes: data.notes || undefined,
      };

      if (isEditMode) {
        await api.put(`/customers/${id}`, payload);
        showToast('Customer profile updated successfully', 'success');
      } else {
        await api.post('/customers', payload);
        showToast('Customer account created successfully', 'success');
      }
      navigate('/customers');
    } catch (err: any) {
      showToast(err.message || 'Failed to save customer', 'error');
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/customers"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-400" />
              {isEditMode ? 'Edit Customer Profile' : 'Add New Customer Account'}
            </h1>
            <p className="text-xs text-slate-400">Enter commercial and contact details for CRM tracking</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Input
                label="Customer Contact Name *"
                placeholder="e.g. Ramesh Kulkarni"
                {...register('customerName')}
                error={errors.customerName?.message}
                className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <Input
                label="Business / Enterprise Name *"
                placeholder="e.g. Apex Industrial Solutions Pvt Ltd"
                {...register('businessName')}
                error={errors.businessName?.message}
                className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <Input
                label="Mobile / Phone Number *"
                placeholder="+91 9823012345"
                {...register('mobileNumber')}
                error={errors.mobileNumber?.message}
                className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <Input
                label="Official Email Address"
                type="email"
                placeholder="procurement@apexind.com"
                {...register('email')}
                error={errors.email?.message}
                className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <Select
                label="Customer Classification Type *"
                options={[
                  { value: 'RETAIL', label: 'Retail Client' },
                  { value: 'WHOLESALE', label: 'Wholesale Buyer' },
                  { value: 'DISTRIBUTOR', label: 'Authorized Distributor' },
                ]}
                {...register('customerType')}
                error={errors.customerType?.message}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div>
              <Select
                label="Account Status *"
                options={[
                  { value: 'LEAD', label: 'Lead (Prospective)' },
                  { value: 'ACTIVE', label: 'Active (Trading)' },
                  { value: 'INACTIVE', label: 'Inactive / Suspended' },
                ]}
                {...register('status')}
                error={errors.status?.message}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div>
              <Input
                label="GST Identification Number (GSTIN)"
                placeholder="27AAACA1234A1Z5"
                {...register('gstNumber')}
                error={errors.gstNumber?.message}
                className="bg-slate-900 border-slate-700 text-white font-mono placeholder-slate-500"
              />
            </div>

            <div>
              <Input
                label="Initial Next Follow-up Date"
                type="date"
                {...register('followUpDate')}
                error={errors.followUpDate?.message}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Registered Billing & Delivery Address *
            </label>
            <textarea
              rows={3}
              {...register('address')}
              placeholder="Full physical dispatch / invoice address..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 text-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-500"
            />
            {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              CRM Internal Notes & Terms
            </label>
            <textarea
              rows={2}
              {...register('notes')}
              placeholder="Commercial terms, payment credit days, preferred dispatch transporter..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 text-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Link to="/customers">
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
              {isEditMode ? 'Update Customer' : 'Save Customer Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
