import React from 'react';
import Link from 'next/link';
import { RotateCcw, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 border border-slate-200">
        <RotateCcw className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">
        Record Not Found
      </h2>
      <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
        The requested order or return record does not exist, or has been removed via policy soft deletion.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/returns"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Queue</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

