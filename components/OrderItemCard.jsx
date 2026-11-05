import React from 'react';
import Link from 'next/link';
import { PlusCircle, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { StatusBadge } from './Badge';
import { LIVE_STATUSES } from '@/lib/constants';

export function OrderItemCard({ item, orderId, customerName, customerEmail, customerPhone }) {
  // Check if item has any live return requests
  const liveReturn = item.returnRequests?.find((r) => LIVE_STATUSES.includes(r.status));
  const hasLiveReturn = Boolean(liveReturn);

  const subtotal = parseFloat(item.unitPrice) * item.quantity;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl gap-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-xs text-slate-500 shrink-0 font-mono">
            {item.sku}
          </div>
        )}

        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 truncate">
            {item.productName}
          </h4>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
              SKU: {item.sku}
            </span>
            <span>•</span>
            <span>Qty: <strong className="text-slate-700">{item.quantity}</strong></span>
            <span>•</span>
            <span>Unit: <strong className="text-slate-700">{formatCurrency(item.unitPrice)}</strong></span>
          </div>

          {hasLiveReturn && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                Live Request Active:
              </span>
              <Link
                href={`/returns/${liveReturn.id}`}
                className="text-xs font-mono font-semibold text-emerald-600 hover:underline flex items-center gap-1"
              >
                {liveReturn.reference}
              </Link>
              <StatusBadge status={liveReturn.status} size="sm" />
            </div>
          )}
        </div>
      </div>

      <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
        <div className="text-right">
          <span className="text-xs text-slate-400 block sm:inline">Subtotal: </span>
          <span className="text-sm font-bold font-mono text-slate-900">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {hasLiveReturn ? (
          <Link
            href={`/returns/${liveReturn.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <span>View Active Request</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <Link
            href={`/returns/create?orderId=${encodeURIComponent(orderId)}&itemId=${encodeURIComponent(
              item.id
            )}&customerName=${encodeURIComponent(customerName)}&customerEmail=${encodeURIComponent(
              customerEmail
            )}&customerPhone=${encodeURIComponent(customerPhone)}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Return Request</span>
          </Link>
        )}
      </div>
    </div>
  );
}

