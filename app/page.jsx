import React from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  CheckCheck,
  Plus,
  ShoppingBag,
} from 'lucide-react';
import { getDashboardStats } from '@/services/statsService';
import { StatCard } from '@/components/StatCard';
import { StatusDistributionChart } from '@/components/StatusDistributionChart';
import { ReasonDistributionChart } from '@/components/ReasonDistributionChart';
import { RecentReturnsTable } from '@/components/RecentReturnsTable';
import { RecentActivityFeed } from '@/components/RecentActivityFeed';

// Opt out of static caching for real-time dashboard data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  let statsData = {
    metrics: { total: 0, open: 0, inReview: 0, approved: 0, rejected: 0, completed: 0 },
    statusDistribution: [],
    reasonDistribution: [],
    recentReturns: [],
    recentActivity: [],
  };
  let errorMsg = null;

  try {
    statsData = await getDashboardStats();
  } catch (err) {
    console.error('Failed to load dashboard metrics:', err);
    errorMsg = err.message;
  }

  const { metrics, statusDistribution, reasonDistribution, recentReturns, recentActivity } = statsData;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Support Operations
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5">
            ReturnDesk Operations Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Live lifecycle monitoring, policy-enforced returns triage, and resolution management.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-700/60 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Mock Orders</span>
          </Link>

          <Link
            href="/returns/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Return</span>
          </Link>
        </div>
      </div>

      {/* How It Works - Step-by-Step Workflow Guide */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 text-white shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-semibold text-white tracking-wide">
              How ReturnDesk Works (Step-by-Step Flow)
            </h2>
          </div>
          <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
            10 Mock Orders Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Step 1
            </span>
            <h4 className="font-semibold text-slate-100">1. Select an Order</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Go to <Link href="/orders" className="text-emerald-400 hover:underline font-medium">Orders</Link> and pick any customer order (e.g. Rahul Sharma).
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Step 2
            </span>
            <h4 className="font-semibold text-slate-100">2. Create Return</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Click &quot;Create Return Request&quot; on any purchased line item. Reference ID is auto-generated.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Step 3
            </span>
            <h4 className="font-semibold text-slate-100">3. Review & Approve</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Open the request. Move it to <em>In Review</em>, then click <em>Approve</em> and choose Refund or Replacement.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Step 4
            </span>
            <h4 className="font-semibold text-slate-100">4. Mark Completed</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Click <em>Mark as Completed</em> to close ticket. Watch metrics update live across this dashboard!
            </p>
          </div>
        </div>
      </div>

      {/* 6 Metric Statistics Cards (Section 3 Requirement) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Requests"
          value={metrics.total}
          icon={RotateCcw}
          color="slate"
          badgeText="All Time"
          href="/returns"
        />

        <StatCard
          title="Open"
          value={metrics.open}
          icon={Inbox}
          color="amber"
          badgeText="Awaiting Triage"
          href="/returns?status=Open"
        />

        <StatCard
          title="In Review"
          value={metrics.inReview}
          icon={Clock}
          color="blue"
          badgeText="Under Agent Review"
          href="/returns?status=In+Review"
        />

        <StatCard
          title="Approved"
          value={metrics.approved}
          icon={CheckCircle2}
          color="emerald"
          badgeText="Resolution Set"
          href="/returns?status=Approved"
        />

        <StatCard
          title="Rejected"
          value={metrics.rejected}
          icon={XCircle}
          color="rose"
          badgeText="Declined"
          href="/returns?status=Rejected"
        />

        <StatCard
          title="Completed"
          value={metrics.completed}
          icon={CheckCheck}
          color="slate"
          badgeText="Closed"
          href="/returns?status=Completed"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistributionChart
          data={statusDistribution}
          total={metrics.total}
        />
        <ReasonDistributionChart
          data={reasonDistribution}
          total={metrics.total}
        />
      </div>

      {/* Recent Returns Table & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <RecentReturnsTable requests={recentReturns} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivityFeed activities={recentActivity} />
        </div>
      </div>
    </div>
  );
}

