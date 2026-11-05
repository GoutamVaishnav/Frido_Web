import React from 'react';
import Link from 'next/link';
import { REASON_CONFIG } from '@/lib/constants';

export function ReasonDistributionChart({ data = [], total = 0 }) {
  const reasonColors = {
    Damaged: 'bg-rose-500',
    'Wrong Item': 'bg-purple-500',
    'Size Issue': 'bg-indigo-500',
    'Not As Described': 'bg-amber-500',
    'Changed Mind': 'bg-teal-500',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Return Reasons Distribution
            </h3>
            <p className="text-xs text-slate-500">Root cause analysis of customer requests</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded-md text-slate-600">
            5 Categories
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full flex overflow-hidden p-0.5 gap-0.5 mb-6">
          {data.map((item) => {
            if (item.count === 0) return null;
            const color = reasonColors[item.reason] || 'bg-slate-400';
            return (
              <div
                key={item.reason}
                style={{ width: `${item.percentage}%` }}
                title={`${item.reason}: ${item.count} (${item.percentage}%)`}
                className={`h-full first:rounded-l-full last:rounded-r-full transition-all ${color}`}
              />
            );
          })}
        </div>

        {/* Breakdown Items List */}
        <div className="space-y-3">
          {data.map((item) => {
            const dotColor = reasonColors[item.reason] || 'bg-slate-400';
            return (
              <Link
                key={item.reason}
                href={`/returns?reason=${encodeURIComponent(item.reason)}`}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                  <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">
                    {item.reason}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-900">
                    {item.count}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono w-10 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
