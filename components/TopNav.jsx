'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  RotateCcw,
  Plus,
  ShoppingBag,
  Bell,
  Search,
  ExternalLink,
} from 'lucide-react';

export function TopNav({ onMenuClick }) {
  const pathname = usePathname();

  // Compute readable breadcrumb title
  let sectionTitle = 'Dashboard Overview';
  if (pathname === '/returns') sectionTitle = 'Return Requests';
  else if (pathname.startsWith('/returns/create')) sectionTitle = 'Create Return Request';
  else if (pathname.startsWith('/returns/')) sectionTitle = 'Return Request Details';
  else if (pathname === '/orders') sectionTitle = 'Customer Orders';
  else if (pathname.startsWith('/orders/')) sectionTitle = 'Order Details';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">
            {sectionTitle}
          </span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" />
          <span className="hidden sm:inline-block text-xs text-slate-500">
            Support Portal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick link to create return */}
        <Link
          href="/returns/create"
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Return</span>
        </Link>

        {/* Orders link */}
        <Link
          href="/orders"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Browse Orders"
        >
          <ShoppingBag className="w-4 h-4" />
        </Link>

        {/* Database status pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-slate-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Neon PostgreSQL</span>
        </div>
      </div>
    </header>
  );
}
