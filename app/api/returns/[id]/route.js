import {
  getReturnRequestById,
  updateReturnDetails,
  softDeleteReturnRequest,
} from '@/services/returnService';
import { successResponse, errorResponse, ERROR_CODES } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return errorResponse('Return request ID or reference is required.', ERROR_CODES.BAD_REQUEST, 400);
    }

    const returnRequest = await getReturnRequestById(id);

    if (!returnRequest) {
      return errorResponse(
        `Return request '${id}' was not found or has been removed.`,
        ERROR_CODES.NOT_FOUND,
        404
      );
    }

    return successResponse(returnRequest);
  } catch (err) {
    console.error(`Error in GET /api/returns/${params.id}:`, err);
    return errorResponse(
      err.message || 'Failed to retrieve return request.',
      err.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
      err.statusCode || 500
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return errorResponse('Invalid JSON request body.', ERROR_CODES.BAD_REQUEST, 400);
    }

    const updated = await updateReturnDetails(id, body);
    return successResponse(updated);
  } catch (err) {
    console.error(`Error in PATCH /api/returns/${params.id}:`, err);
    return errorResponse(
      err.message || 'Failed to update return request details.',
      err.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
      err.statusCode || 500
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const agentName = searchParams.get('agentName') || 'Support Agent';

    const result = await softDeleteReturnRequest(id, agentName);
    return successResponse(result);
  } catch (err) {
    console.error(`Error in DELETE /api/returns/${params.id}:`, err);
    return errorResponse(
      err.message || 'Failed to remove return request.',
      err.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
      err.statusCode || 500
    );
  }
}
