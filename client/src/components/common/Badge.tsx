import React from 'react';

export interface BadgeProps {
  status?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant = 'neutral',
  children,
  className = '',
}) => {
  let activeVariant = variant;
  if (status) {
    const s = status.toUpperCase();
    if (s === 'DELIVERED' || s === 'COMPLETED' || s === 'CONFIRMED') activeVariant = 'success';
    else if (s === 'PROCESSING' || s === 'SHIPPED') activeVariant = 'primary';
    else if (s === 'PENDING') activeVariant = 'warning';
    else if (s === 'CANCELLED' || s === 'FAILED') activeVariant = 'danger';
  }

  const styles = {
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[activeVariant]} ${className}`}
    >
      {children ?? status}
    </span>
  );
};
