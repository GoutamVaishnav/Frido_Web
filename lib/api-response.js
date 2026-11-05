import { NextResponse } from 'next/server.js';

/**
 * Standard Success Response Helper
 */
export function successResponse(data, status = 200, pagination = null) {
  const body = {
    success: true,
    data,
  };

  if (pagination) {
    body.pagination = pagination;
  }

  return NextResponse.json(body, { status });
}

/**
 * Standard Error Response Helper
 * Follows the strict requirement format:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "CODE",
 *     "message": "Human readable message"
 *   }
 * }
 */
export function errorResponse(message, code = 'BAD_REQUEST', status = 400, details = null) {
  const body = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    body.error.details = details;
  }

  return NextResponse.json(body, { status });
}

export const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_LIVE_REQUEST: 'DUPLICATE_LIVE_REQUEST',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  RESOLUTION_REQUIRED: 'RESOLUTION_REQUIRED',
  INVALID_REFUND_AMOUNT: 'INVALID_REFUND_AMOUNT',
  DETAILS_LOCKED: 'DETAILS_LOCKED',
  CANNOT_DELETE_REQUEST: 'CANNOT_DELETE_REQUEST',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
};
