import prisma from '@/lib/prisma';
import { RETURN_STATUSES, ALL_RETURN_STATUSES, ALL_RETURN_REASONS } from '@/lib/constants';

/**
 * Calculates live dashboard statistics and breakdown charts from database records
 */
export async function getDashboardStats() {
  const baseWhere = { deletedAt: null };

  // Total return requests
  const total = await prisma.returnRequest.count({ where: baseWhere });

  // Counts by status
  const statusCounts = await prisma.returnRequest.groupBy({
    by: ['status'],
    where: baseWhere,
    _count: {
      status: true,
    },
  });

  const statusMap = {};
  ALL_RETURN_STATUSES.forEach((st) => {
    statusMap[st] = 0;
  });

  statusCounts.forEach((sc) => {
    statusMap[sc.status] = sc._count.status;
  });

  // Counts by reason
  const reasonCounts = await prisma.returnRequest.groupBy({
    by: ['reason'],
    where: baseWhere,
    _count: {
      reason: true,
    },
  });

  const reasonMap = {};
  ALL_RETURN_REASONS.forEach((r) => {
    reasonMap[r] = 0;
  });

  reasonCounts.forEach((rc) => {
    reasonMap[rc.reason] = rc._count.reason;
  });

  // Recent 5 return requests
  const recentReturns = await prisma.returnRequest.findMany({
    where: baseWhere,
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      order: {
        select: {
          id: true,
        },
      },
      orderItem: {
        select: {
          productName: true,
          sku: true,
          imageUrl: true,
          unitPrice: true,
        },
      },
    },
  });

  // Recent activity (latest notes / actions across all returns)
  const recentActivity = await prisma.returnNote.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    where: {
      returnRequest: {
        deletedAt: null,
      },
    },
    include: {
      returnRequest: {
        select: {
          id: true,
          reference: true,
          status: true,
          customerName: true,
        },
      },
    },
  });

  return {
    metrics: {
      total,
      open: statusMap[RETURN_STATUSES.OPEN] || 0,
      inReview: statusMap[RETURN_STATUSES.IN_REVIEW] || 0,
      approved: statusMap[RETURN_STATUSES.APPROVED] || 0,
      rejected: statusMap[RETURN_STATUSES.REJECTED] || 0,
      completed: statusMap[RETURN_STATUSES.COMPLETED] || 0,
    },
    statusDistribution: ALL_RETURN_STATUSES.map((status) => ({
      status,
      count: statusMap[status] || 0,
      percentage: total > 0 ? Math.round(((statusMap[status] || 0) / total) * 100) : 0,
    })),
    reasonDistribution: ALL_RETURN_REASONS.map((reason) => ({
      reason,
      count: reasonMap[reason] || 0,
      percentage: total > 0 ? Math.round(((reasonMap[reason] || 0) / total) * 100) : 0,
    })),
    recentReturns,
    recentActivity,
  };
}
