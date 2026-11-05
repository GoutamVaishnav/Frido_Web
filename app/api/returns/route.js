import { getReturnRequests, createReturnRequest } from '@/services/returnService';
import { successResponse, errorResponse, ERROR_CODES } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 1;
    const limit = searchParams.get('limit') || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const reason = searchParams.get('reason') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const result = await getReturnRequests({
      page,
      limit,
      search,
      status,
      reason,
      sortBy,
      sortOrder,
    });

    return successResponse(result.items, 200, result.pagination);
  } catch (err) {
    console.error('Error in GET /api/returns:', err);
    return errorResponse(
      err.message || 'Failed to retrieve return requests.',
      err.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
      err.statusCode || 500
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return errorResponse('Invalid JSON request body.', ERROR_CODES.BAD_REQUEST, 400);
    }

    const created = await createReturnRequest(body);
    return successResponse(created, 201);
  } catch (err) {
    console.error('Error in POST /api/returns:', err);
    return errorResponse(
      err.message || 'Failed to create return request.',
      err.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
      err.statusCode || 500,
      err.details || null
    );
  }
}
