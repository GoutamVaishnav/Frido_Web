import React, { Suspense } from 'react';
import { CreateReturnForm } from '@/components/CreateReturnForm';
import { getOrders } from '@/services/orderService';

export const metadata = {
  title: 'Create Return Request — ReturnDesk',
  description: 'Initiate a new customer return request with automatic reference ID and duplicate checks.',
};

export const dynamic = 'force-dynamic';

export default async function CreateReturnPage() {
  let orders = [];
  try {
    orders = await getOrders();
  } catch (err) {
    console.warn('Orders could not be preloaded on server:', err.message);
  }

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Create Return Request
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Validate customer and item details, enforce single live request policy, and register in Neon PostgreSQL.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            Loading return form...
          </div>
        }
      >
        <CreateReturnForm initialOrders={orders} />
      </Suspense>
    </div>
  );
}
