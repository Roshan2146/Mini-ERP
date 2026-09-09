import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'purple'
    | 'slate'
    | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    slate: 'bg-slate-800 text-white border-slate-700',
    outline: 'border border-slate-300 text-slate-600 bg-transparent',
  };

  const dotStyles = {
    default: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-blue-500',
    purple: 'bg-purple-500',
    slate: 'bg-white',
    outline: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeStyles[size]} ${variantStyles[variant]}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[variant]}`} />}
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
    case 'CONFIRMED':
    case 'COMPLETED':
    case 'PAID':
      return <Badge variant="success" dot>{status}</Badge>;
    case 'LEAD':
    case 'DRAFT':
    case 'PENDING':
    case 'PARTIAL':
      return <Badge variant="warning" dot>{status}</Badge>;
    case 'INACTIVE':
    case 'CANCELLED':
    case 'OUT_OF_STOCK':
      return <Badge variant="danger" dot>{status}</Badge>;
    case 'WHOLESALE':
    case 'DISTRIBUTOR':
      return <Badge variant="purple">{status}</Badge>;
    case 'RETAIL':
      return <Badge variant="info">{status}</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
};
