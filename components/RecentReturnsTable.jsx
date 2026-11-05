import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { StatusBadge, ReasonBadge } from './Badge';
import { formatDate, formatRelativeTime } from '@/utils/formatters';

export function RecentReturnsTable({ requests = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Recent Return Requests
          </h3>
          <p className="text-xs text-slate-500">
            Latest requests queued in the support portal
          </p>
        </div>
        <Link
          href="/returns"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
        >
          <span>View all returns</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-3.5">Reference</th>
              <th className="px-6 py-3.5">Customer</th>
              <th className="px-6 py-3.5">Product</th>
              <th className="px-6 py-3.5">Reason</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Date</th>
              <th className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  No return requests recorded yet.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                    <Link
                      href={`/returns/${req.id}`}
                      className="hover:text-emerald-600 flex items-center gap-1"
                    >
                      {req.reference}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">
                      {req.customerName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {req.customerEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {req.orderItem?.imageUrl ? (
                        <img
                          src={req.orderItem.imageUrl}
                          alt={req.orderItem.productName}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 shrink-0">
                          Item
                        </div>
                      )}
                      <div className="min-w-0 max-w-[200px]">
                        <p className="font-medium text-slate-900 truncate">
                          {req.orderItem?.productName || 'Order Product'}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {req.orderId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <ReasonBadge reason={req.reason} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    {formatDate(req.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/returns/${req.id}`}
                      className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

