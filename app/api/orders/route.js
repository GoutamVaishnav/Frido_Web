import { getOrders } from '@/services/orderService';
import { successResponse, errorResponse, ERROR_CODES } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const orders = await getOrders({ search });
    return successResponse(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    return errorResponse(
      err.message || 'Failed to retrieve orders.',
      err.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
      err.statusCode || 500
    );
  }
}
