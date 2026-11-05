import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Plus } from 'lucide-react';
import { OrderTable } from '@/components/OrderTable';

export const metadata = {
  title: 'Customer Orders — ReturnDesk',
  description: 'Manage and review mock e-commerce customer orders and initiate return requests.',
};

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Customer Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse 10 reference orders to inspect line items and initiate returns.
          </p>
        </div>

        <Link
          href="/returns/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Return Request</span>
        </Link>
      </div>

      {/* Orders Table Component */}
      <OrderTable />
    </div>
  );
}
