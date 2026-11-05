import React, { Suspense } from 'react';
import Link from 'next/link';
import { PlusCircle, RotateCcw } from 'lucide-react';
import { ReturnRequestsTable } from '@/components/ReturnRequestsTable';
import { TableRowSkeleton } from '@/components/Skeleton';

export const metadata = {
  title: 'Return Requests — ReturnDesk',
  description: 'Manage, search, triage, and filter all customer return and replacement requests.',
};

export default function ReturnsPage() {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Return Requests Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Server-side debounced search, status/reason filters, sortable columns, and pagination.
          </p>
        </div>

        <Link
          href="/returns/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Return Request</span>
        </Link>
      </div>

      {/* Main Table with Suspense Boundary */}
      <Suspense
        fallback={
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="h-6 w-32 bg-slate-200 animate-pulse rounded mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 animate-pulse rounded" />
              ))}
            </div>
          </div>
        }
      >
        <ReturnRequestsTable />
      </Suspense>
    </div>
  );
}
