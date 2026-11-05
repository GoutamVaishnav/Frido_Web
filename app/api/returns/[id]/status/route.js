import { updateReturnStatus } from '@/services/returnService';
import { successResponse, errorResponse, ERROR_CODES } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return errorResponse('Invalid JSON request body.', ERROR_CODES.BAD_REQUEST, 400);
    }

    const { status, resolution, refundAmount, agentName, noteText } = body;

    if (!status) {
      return errorResponse('New status is required.', ERROR_CODES.BAD_REQUEST, 400);
    }

    const updated = await updateReturnStatus(id, {
      status,
      resolution,
      refundAmount,
      agentName,
      noteText,
    });

    return successResponse(updated);
  } catch (err) {
    console.error(`Error in PATCH /api/returns/${params.id}/status:`, err);
    return errorResponse(
      err.message || 'Failed to update return status.',
      err.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
      err.statusCode || 500
    );
  }
}
