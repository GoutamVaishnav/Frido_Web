import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Phone,
  Package,
  CheckCircle2,
  Receipt,
  PlusCircle,
  RotateCcw,
} from 'lucide-react';
import { getOrderById } from '@/services/orderService';
import { OrderItemCard } from '@/components/OrderItemCard';
import { formatCurrency, formatDate } from '@/utils/formatters';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }) {
  const { id } = params;

  let order = null;
  try {
    order = await getOrderById(id);
  } catch (err) {
    console.error('Error fetching order:', err);
    notFound();
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Orders</span>
        </Link>

        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
          Order Status: {order.status}
        </span>
      </div>

      {/* Main Order Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {order.id}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-2">
              Order Details & Line Items
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Placed on {formatDate(order.orderDate)}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Total Amount</span>
            <span className="text-2xl font-bold font-mono text-slate-900">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Customer Contact Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Customer Name
              </span>
              <span className="text-xs font-bold text-slate-900">
                {order.customerName}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Customer Email
              </span>
              <span className="text-xs font-medium text-slate-900">
                {order.customerEmail}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Phone Number
              </span>
              <span className="text-xs font-medium text-slate-900">
                {order.customerPhone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Purchased Products List */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              Purchased Products ({order.items?.length || 0})
            </h3>
            <p className="text-xs text-slate-500">
              Click &quot;Create Return Request&quot; on any line item to launch a pre-populated return form.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {order.items?.map((item) => (
            <OrderItemCard
              key={item.id}
              item={item}
              orderId={order.id}
              customerName={order.customerName}
              customerEmail={order.customerEmail}
              customerPhone={order.customerPhone}
            />
          ))}
        </div>
      </div>

      {/* Historical Return Requests on this Order */}
      {order.returnRequests && order.returnRequests.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-slate-600" />
            Existing Returns Associated With This Order
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {order.returnRequests.map((ret) => (
              <div key={ret.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold text-slate-900">
                    {ret.reference}
                  </span>
                  <span className="text-slate-500">
                    Status: <strong className="text-slate-700">{ret.status}</strong>
                  </span>
                </div>
                <Link
                  href={`/returns/${ret.id}`}
                  className="text-emerald-600 font-semibold hover:underline"
                >
                  View Return →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
