import { getOrderById } from '@/services/orderService';
import { successResponse, errorResponse, ERROR_CODES } from '@/lib/api-response';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return errorResponse('Order ID parameter is required.', ERROR_CODES.BAD_REQUEST, 400);
    }

    const order = await getOrderById(id);
    return successResponse(order);
  } catch (err) {
    console.error('Error fetching order by ID:', err);
    return errorResponse(
      err.message || 'Failed to retrieve order.',
      err.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
      err.statusCode || 500
    );
  }
}
