import React from 'react';
import Link from 'next/link';
import { MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { formatRelativeTime } from '@/utils/formatters';
import { StatusBadge } from './Badge';

export function RecentActivityFeed({ activities = [] }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Recent Activity Feed
            </h3>
            <p className="text-xs text-slate-500">Live agent actions and status updates</p>
          </div>
          <Clock className="w-4 h-4 text-slate-400" />
        </div>

        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No recent activity recorded.
            </p>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs group">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5 border border-slate-200/60">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 truncate">
                      {act.agentName}
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatRelativeTime(act.createdAt)}
                    </span>
                  </div>
                  <p className="text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                    {act.text}
                  </p>
                  {act.returnRequest && (
                    <div className="mt-1 flex items-center gap-2">
                      <Link
                        href={`/returns/${act.returnRequest.id}`}
                        className="text-[11px] font-mono font-medium text-emerald-600 hover:underline flex items-center gap-0.5"
                      >
                        <span>{act.returnRequest.reference}</span>
                      </Link>
                      <StatusBadge status={act.returnRequest.status} size="sm" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

