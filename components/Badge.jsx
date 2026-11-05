import React from 'react';
import { STATUS_CONFIG, REASON_CONFIG } from '@/lib/constants';

export function StatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs font-medium'
      : 'px-2.5 py-1 text-xs font-semibold tracking-wide';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}

export function ReasonBadge({ reason }) {
  const config = REASON_CONFIG[reason] || {
    label: reason || 'Unknown',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${config.badge}`}
    >
      {config.label}
    </span>
  );
}

export function ResolutionBadge({ resolution }) {
  if (!resolution) return null;

  const styles = {
    Refund: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Replacement: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    'Store Credit': 'bg-violet-50 text-violet-800 border-violet-200',
  }[resolution] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-semibold ${styles}`}
    >
      {resolution}
    </span>
  );
}

