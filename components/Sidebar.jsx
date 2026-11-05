'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  RotateCcw,
  ShoppingBag,
  PlusCircle,
  ShieldCheck,
  Headphones,
  ExternalLink,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: 'Return Requests',
    href: '/returns',
    icon: RotateCcw,
  },
  {
    name: 'Orders',
    href: '/orders',
    icon: ShoppingBag,
  },
  {
    name: 'Create Return',
    href: '/returns/create',
    icon: PlusCircle,
  },
];

export function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800/80 bg-slate-950/40">
          <Link href="/" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <RotateCcw className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                ReturnDesk
                <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  PRO
                </span>
              </span>
              <p className="text-[11px] text-slate-400 font-normal">Support Management</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            System & Neon DB
          </div>

          <div className="px-3 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Neon Engine
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                Postgres
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Business rules enforced strictly on server side.
            </p>
          </div>
        </div>

        {/* Support Agent Profile Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-inner">
                SA
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Agent Sarah Davis</p>
              <p className="text-[11px] text-slate-400 truncate">Tier 2 Support Specialist</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

