import React from 'react';
import Link from 'next/link';
import { STATUS_CONFIG } from '@/lib/constants';

export function StatusDistributionChart({ data = [], total = 0 }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Return Requests by Status
            </h3>
            <p className="text-xs text-slate-500">Live distribution of requests in database</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded-md text-slate-600">
            {total} Total
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full flex overflow-hidden p-0.5 gap-0.5 mb-6">
          {data.map((item) => {
            if (item.count === 0) return null;
            const barColors = {
              Open: 'bg-amber-400',
              'In Review': 'bg-blue-500',
              Approved: 'bg-emerald-500',
              Rejected: 'bg-rose-500',
              Completed: 'bg-slate-500',
            }[item.status] || 'bg-slate-300';

            return (
              <div
                key={item.status}
                style={{ width: `${item.percentage}%` }}
                title={`${item.status}: ${item.count} (${item.percentage}%)`}
                className={`h-full first:rounded-l-full last:rounded-r-full transition-all ${barColors}`}
              />
            );
          })}
        </div>

        {/* Breakdown Items List */}
        <div className="space-y-3">
          {data.map((item) => {
            const config = STATUS_CONFIG[item.status] || {
              dot: 'bg-slate-400',
              label: item.status,
            };

            return (
              <Link
                key={item.status}
                href={`/returns?status=${encodeURIComponent(item.status)}`}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                  <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">
                    {item.status}
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
