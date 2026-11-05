import {
  RETURN_STATUSES,
  LIVE_STATUSES,
  FINAL_STATUSES,
  LOCKED_STATUSES,
  DELETABLE_STATUSES,
  RESOLUTIONS,
  ALL_RESOLUTIONS,
  ALL_RETURN_REASONS,
} from '../lib/constants.js';
import { ERROR_CODES } from '../lib/api-response.js';
import prisma from '../lib/prisma.js';

/**
 * Valid allowed transitions mapping (Rule 1)
 */
export const ALLOWED_TRANSITIONS = {
  [RETURN_STATUSES.OPEN]: [RETURN_STATUSES.IN_REVIEW],
  [RETURN_STATUSES.IN_REVIEW]: [RETURN_STATUSES.APPROVED, RETURN_STATUSES.REJECTED],
  [RETURN_STATUSES.APPROVED]: [RETURN_STATUSES.COMPLETED],
  [RETURN_STATUSES.REJECTED]: [], // Final state
  [RETURN_STATUSES.COMPLETED]: [], // Final state
};

/**
 * Validates status transition (Rule 1)
 */
export function validateStatusTransition(currentStatus, newStatus) {
  if (!currentStatus || !newStatus) {
    return {
      isValid: false,
      code: ERROR_CODES.INVALID_STATUS_TRANSITION,
      message: 'Current status and new status are both required.',
    };
  }

  if (currentStatus === newStatus) {
    return {
      isValid: false,
      code: ERROR_CODES.INVALID_STATUS_TRANSITION,
      message: `The return request is already in '${currentStatus}' status.`,
    };
  }

  if (FINAL_STATUSES.includes(currentStatus)) {
    return {
      isValid: false,
      code: ERROR_CODES.INVALID_STATUS_TRANSITION,
      message: `Requests in '${currentStatus}' status are in a final terminal state and cannot be changed.`,
    };
  }

  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(newStatus)) {
    return {
      isValid: false,
      code: ERROR_CODES.INVALID_STATUS_TRANSITION,
      message: `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions from '${currentStatus}' are: ${allowedNext.join(', ') || 'none'}.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates resolution and refund details when approving (Rule 2)
 */
export function validateApprovalResolution(newStatus, resolution, refundAmount) {
  // Only applies when transitioning to Approved
  if (newStatus !== RETURN_STATUSES.APPROVED) {
    return { isValid: true };
  }

  if (!resolution) {
    return {
      isValid: false,
      code: ERROR_CODES.RESOLUTION_REQUIRED,
      message: 'An agent cannot approve a request without selecting a resolution (Refund, Replacement, or Store Credit).',
    };
  }

  if (!ALL_RESOLUTIONS.includes(resolution)) {
    return {
      isValid: false,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `Invalid resolution '${resolution}'. Must be one of: ${ALL_RESOLUTIONS.join(', ')}.`,
    };
  }

  if (resolution === RESOLUTIONS.REFUND) {
    const parsedAmount = typeof refundAmount === 'number' ? refundAmount : parseFloat(refundAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return {
        isValid: false,
        code: ERROR_CODES.INVALID_REFUND_AMOUNT,
        message: 'When resolution is Refund, refund amount must be greater than zero.',
      };
    }
  } else {
    // Replacement or Store Credit
    if (refundAmount !== null && refundAmount !== undefined && refundAmount !== '' && Number(refundAmount) > 0) {
      return {
        isValid: false,
        code: ERROR_CODES.INVALID_REFUND_AMOUNT,
        message: `When resolution is '${resolution}', refund amount must be null or absent.`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Checks for live duplicate requests on the same order item (Rule 3)
 */
export async function checkDuplicateLiveRequest(orderItemId, excludeRequestId = null) {
  const where = {
    orderItemId,
    deletedAt: null, // soft-deleted items do not count
    status: {
      in: LIVE_STATUSES,
    },
  };

  if (excludeRequestId) {
    where.id = { not: excludeRequestId };
  }

  const existingLiveRequest = await prisma.returnRequest.findFirst({
    where,
    select: {
      id: true,
      reference: true,
      status: true,
    },
  });

  if (existingLiveRequest) {
    return {
      hasDuplicate: true,
      existingRequest: existingLiveRequest,
      error: {
        code: ERROR_CODES.DUPLICATE_LIVE_REQUEST,
        message: `A live return request (${existingLiveRequest.reference} with status '${existingLiveRequest.status}') already exists for this order item. A customer cannot have two live requests for the same item.`,
      },
    };
  }

  return { hasDuplicate: false };
}

/**
 * Checks if details can be edited (Rule 4)
 */
export function canEditDetails(currentStatus) {
  if (LOCKED_STATUSES.includes(currentStatus)) {
    return {
      canEdit: false,
      code: ERROR_CODES.DETAILS_LOCKED,
      message: `Customer and item details are permanently locked once a request is '${currentStatus}'. Only notes can be added.`,
    };
  }
  return { canEdit: true };
}

/**
 * Checks if request can be soft-deleted (Rule 5)
 */
export function canSoftDelete(currentStatus) {
  if (!DELETABLE_STATUSES.includes(currentStatus)) {
    return {
      canDelete: false,
      code: ERROR_CODES.CANNOT_DELETE_REQUEST,
      message: `Requests can only be removed when status is 'Open' or 'Rejected'. Current status is '${currentStatus}'.`,
    };
  }
  return { canDelete: true };
}

/**
 * Validates payload for creating a return request
 */
export function validateCreateReturnPayload(body) {
  const { orderId, orderItemId, customerName, customerEmail, customerPhone, quantity, reason } = body;

  const errors = [];

  if (!orderId) errors.push('Order ID is required.');
  if (!orderItemId) errors.push('Order Item ID is required.');
  if (!customerName || customerName.trim().length === 0) errors.push('Customer Name is required.');
  if (!customerEmail || !customerEmail.includes('@')) errors.push('A valid Customer Email is required.');
  if (!customerPhone || customerPhone.trim().length === 0) errors.push('Customer Phone is required.');
  
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) errors.push('Quantity must be an integer greater than 0.');

  if (!reason || !ALL_RETURN_REASONS.includes(reason)) {
    errors.push(`Return reason must be one of: ${ALL_RETURN_REASONS.join(', ')}.`);
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: errors.join(' '),
      details: errors,
    };
  }

  return { isValid: true };
}
