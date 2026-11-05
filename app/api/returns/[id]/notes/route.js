import { addReturnNote } from '@/services/returnService';
import { successResponse, errorResponse, ERROR_CODES } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return errorResponse('Invalid JSON request body.', ERROR_CODES.BAD_REQUEST, 400);
    }

    const { agentName, text } = body;

    const note = await addReturnNote(id, { agentName, text });
    return successResponse(note, 201);
  } catch (err) {
    console.error(`Error in POST /api/returns/${params.id}/notes:`, err);
    return errorResponse(
      err.message || 'Failed to add note.',
      err.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
      err.statusCode || 500
    );
  }
}
