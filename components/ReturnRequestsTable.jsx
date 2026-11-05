'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { StatusBadge, ReasonBadge } from './Badge';
import { formatDate } from '@/utils/formatters';
import { TableRowSkeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
import { ALL_RETURN_STATUSES, ALL_RETURN_REASONS } from '@/lib/constants';

export function ReturnRequestsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state defaults
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || '';
  const initialReason = searchParams.get('reason') || '';
  const initialSortBy = searchParams.get('sortBy') || 'createdAt';
  const initialSortOrder = searchParams.get('sortOrder') || 'desc';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  // Component states
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [status, setStatus] = useState(initialStatus);
  const [reason, setReason] = useState(initialReason);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(10);

  const [data, setData] = useState({ items: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from server API
  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (status && status !== 'ALL') params.set('status', status);
      if (reason && reason !== 'ALL') params.set('reason', reason);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      params.set('page', page.toString());
      params.set('limit', limit.toString());

      // Update browser URL query string without reloading
      const urlQuery = params.toString();
      router.replace(`/returns?${urlQuery}`, { scroll: false });

      const res = await fetch(`/api/returns?${urlQuery}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to fetch return requests.');
      }

      setData({
        items: json.data || [],
        pagination: json.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, reason, sortBy, sortOrder, page, limit, router]);

  // Trigger fetch when query params change
  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  // Reset to page 1 whenever search or filters change
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handleReasonChange = (e) => {
    setReason(e.target.value);
    setPage(1);
  };

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput('');
    setStatus('');
    setReason('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters = Boolean(searchInput || status || reason);

  return (
    <div className="space-y-4">
      {/* Control Bar: Debounced Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input (Debounced server search) */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search by reference (RET-...), customer, or order ID..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                setPage(1);
              }}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={status}
              onChange={handleStatusChange}
              className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100/70 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              {ALL_RETURN_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={reason}
              onChange={handleReasonChange}
              className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100/70 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="">All Reasons</option>
              {ALL_RETURN_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th
                  onClick={() => toggleSort('reference')}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Return Reference</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('customerName')}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Customer</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5 text-center">Qty</th>
                <th className="px-6 py-3.5">Reason</th>
                <th
                  onClick={() => toggleSort('status')}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('createdAt')}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Created Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={9} />
                ))
              ) : error ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-rose-500">
                    {error}
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12">
                    <EmptyState
                      title="No Return Requests Found"
                      description="No records match the selected search, status, or reason filters."
                      actionLabel={hasActiveFilters ? 'Clear all filters' : 'Create Return Request'}
                      actionHref={hasActiveFilters ? null : '/returns/create'}
                      onAction={hasActiveFilters ? clearFilters : null}
                    />
                  </td>
                </tr>
              ) : (
                data.items.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      <Link
                        href={`/returns/${req.id}`}
                        className="hover:text-emerald-600 transition-colors flex items-center gap-1.5"
                      >
                        <span>{req.reference}</span>
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

                    <td className="px-6 py-4 font-mono text-slate-600 whitespace-nowrap">
                      <Link
                        href={`/orders/${req.orderId}`}
                        className="hover:text-emerald-600 hover:underline"
                      >
                        {req.orderId}
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5 max-w-[220px]">
                        {req.orderItem?.imageUrl ? (
                          <img
                            src={req.orderItem.imageUrl}
                            alt=""
                            className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : null}
                        <span className="truncate font-medium text-slate-900">
                          {req.orderItem?.productName || 'Purchased Item'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center font-semibold text-slate-900">
                      {req.quantity}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <ReasonBadge reason={req.reason} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={req.status} size="sm" />
                    </td>

                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {formatDate(req.createdAt)}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/returns/${req.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <span>Manage</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-side Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500 gap-4">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-900">
              {data.pagination.total === 0 ? 0 : (page - 1) * limit + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(data.pagination.total, page * limit)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-900">
              {data.pagination.total}
            </span>{' '}
            total requests
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors font-medium text-slate-700"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-2 text-slate-600 font-medium">
              Page {page} of {data.pagination.totalPages || 1}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
              disabled={page >= data.pagination.totalPages || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors font-medium text-slate-700"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

