import { getDashboardStats } from '@/services/statsService';
import { successResponse, errorResponse, ERROR_CODES } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return successResponse(stats);
  } catch (err) {
    console.error('Error fetching dashboard statistics:', err);
    return errorResponse(
      err.message || 'Failed to retrieve dashboard statistics.',
      err.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
      err.statusCode || 500
    );
  }
}
