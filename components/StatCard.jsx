import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  badgeText,
  color = 'slate',
  href,
}) {
  const colorThemes = {
    slate: {
      iconBg: 'bg-slate-100 text-slate-700',
      border: 'hover:border-slate-300',
      glow: 'hover:shadow-slate-100',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-700 border border-amber-200/60',
      border: 'hover:border-amber-300',
      glow: 'hover:shadow-amber-50',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-700 border border-blue-200/60',
      border: 'hover:border-blue-300',
      glow: 'hover:shadow-blue-50',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
      border: 'hover:border-emerald-300',
      glow: 'hover:shadow-emerald-50',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-700 border border-rose-200/60',
      border: 'hover:border-rose-300',
      glow: 'hover:shadow-rose-50',
    },
  }[color] || {
    iconBg: 'bg-slate-100 text-slate-700',
    border: 'hover:border-slate-300',
    glow: 'hover:shadow-slate-100',
  };

  const Content = (
    <div
      className={`group relative p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm transition-all duration-200 ${colorThemes.border} ${colorThemes.glow} hover:-translate-y-0.5`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${colorThemes.iconBg}`}
        >
          {Icon && <Icon className="w-4 h-4 stroke-[2.2]" />}
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-bold tracking-tight text-slate-900">
          {value !== undefined ? value : '—'}
        </span>
        {badgeText && (
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {badgeText}
          </span>
        )}
      </div>

      {description && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>{description}</span>
          {href && (
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{Content}</Link>;
  }

  return Content;
}

