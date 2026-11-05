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

      {errorMsg && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
          <strong>Database Notice:</strong> {errorMsg}. Please ensure your Neon PostgreSQL connection string is configured in <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">.env</code> and run <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">npm run prisma:seed</code>.
        </div>
      )}

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

