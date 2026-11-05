import prisma from '@/lib/prisma';
import { ERROR_CODES } from '@/lib/api-response';

/**
 * Fetch all orders with optional search across order ID, customer name, and customer email
 */
export async function getOrders({ search = '' } = {}) {
  const where = {};

  if (search && search.trim().length > 0) {
    const term = search.trim();
    where.OR = [
      { id: { contains: term, mode: 'insensitive' } },
      { customerName: { contains: term, mode: 'insensitive' } },
      { customerEmail: { contains: term, mode: 'insensitive' } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: {
      orderDate: 'desc',
    },
    include: {
      items: true,
      returnRequests: {
        where: { deletedAt: null },
        select: {
          id: true,
          reference: true,
          status: true,
          orderItemId: true,
        },
      },
    },
  });

  return orders;
}

/**
 * Fetch a single order by ID with its items and associated return requests
 */
export async function getOrderById(id) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          returnRequests: {
            where: { deletedAt: null },
            select: {
              id: true,
              reference: true,
              status: true,
              createdAt: true,
            },
          },
        },
      },
      returnRequests: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!order) {
    const error = new Error(`Order '${id}' not found.`);
    error.code = ERROR_CODES.NOT_FOUND;
    error.statusCode = 404;
    throw error;
  }

  return order;
}

