import prisma from '@/lib/prisma';
import {
  RETURN_STATUSES,
  ALL_RETURN_STATUSES,
  ALL_RETURN_REASONS,
} from '@/lib/constants';
import {
  validateStatusTransition,
  validateApprovalResolution,
  checkDuplicateLiveRequest,
  canEditDetails,
  canSoftDelete,
  validateCreateReturnPayload,
} from './businessRules';
import { generateReturnReference } from '@/utils/referenceGenerator';
import { ERROR_CODES } from '@/lib/api-response';

/**
 * Server-side queried return requests with search, filter, sort, pagination
 */
export async function getReturnRequests({
  page = 1,
  limit = 10,
  search = '',
  status = '',
  reason = '',
  sortBy = 'createdAt',
  sortOrder = 'desc',
}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  // Base where condition: never return soft-deleted records in regular list (Rule 5)
  const where = {
    deletedAt: null,
  };

  // Status Filter
  if (status && status !== 'ALL' && ALL_RETURN_STATUSES.includes(status)) {
    where.status = status;
  }

  // Reason Filter
  if (reason && reason !== 'ALL' && ALL_RETURN_REASONS.includes(reason)) {
    where.reason = reason;
  }

  // Search Filter: search across reference, customerName, customerEmail, orderId
  if (search && search.trim().length > 0) {
    const term = search.trim();
    where.OR = [
      { reference: { contains: term, mode: 'insensitive' } },
      { customerName: { contains: term, mode: 'insensitive' } },
      { customerEmail: { contains: term, mode: 'insensitive' } },
      { orderId: { contains: term, mode: 'insensitive' } },
    ];
  }

  // Sorting
  const validSortColumns = ['createdAt', 'reference', 'customerName', 'status', 'quantity', 'updatedAt'];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';
  const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

  const [total, items] = await Promise.all([
    prisma.returnRequest.count({ where }),
    prisma.returnRequest.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { [sortColumn]: orderDirection },
      include: {
        order: {
          select: {
            id: true,
            orderDate: true,
            status: true,
          },
        },
        orderItem: {
          select: {
            id: true,
            productName: true,
            sku: true,
            imageUrl: true,
            unitPrice: true,
            quantity: true,
          },
        },
        notes: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { id: true, createdAt: true, text: true, agentName: true },
        },
      },
    }),
  ]);

  return {
    items,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

/**
 * Fetch a single return request by ID or Reference
 * Excludes soft-deleted requests per Rule 5
 */
export async function getReturnRequestById(idOrRef) {
  const request = await prisma.returnRequest.findFirst({
    where: {
      OR: [{ id: idOrRef }, { reference: idOrRef }],
      deletedAt: null, // Rule 5: Removed requests must not be accessible through normal request-detail APIs
    },
    include: {
      order: {
        include: {
          items: true,
        },
      },
      orderItem: true,
      notes: {
        orderBy: {
          createdAt: 'asc', // Chronological order
        },
      },
    },
  });

  return request;
}

/**
 * Create a new return request with full validations and reference generation
 */
export async function createReturnRequest(data) {
  // Validate inputs
  const validation = validateCreateReturnPayload(data);
  if (!validation.isValid) {
    const error = new Error(validation.message);
    error.code = validation.code;
    error.statusCode = 400;
    throw error;
  }

  // Verify order item exists and check requested quantity against ordered quantity
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: data.orderItemId },
    include: { order: true },
  });

  if (!orderItem) {
    const error = new Error('The specified order item was not found.');
    error.code = ERROR_CODES.NOT_FOUND;
    error.statusCode = 404;
    throw error;
  }

  if (data.orderId !== orderItem.orderId) {
    const error = new Error('Order ID does not match the purchased item order.');
    error.code = ERROR_CODES.VALIDATION_ERROR;
    error.statusCode = 400;
    throw error;
  }

  const requestedQty = parseInt(data.quantity, 10);
  if (requestedQty > orderItem.quantity) {
    const error = new Error(`Quantity to return (${requestedQty}) cannot exceed purchased quantity (${orderItem.quantity}).`);
    error.code = ERROR_CODES.VALIDATION_ERROR;
    error.statusCode = 400;
    throw error;
  }

  // Rule 3: Check duplicate live request for same order item
  const duplicateCheck = await checkDuplicateLiveRequest(data.orderItemId);
  if (duplicateCheck.hasDuplicate) {
    const error = new Error(duplicateCheck.error.message);
    error.code = duplicateCheck.error.code;
    error.statusCode = 409;
    throw error;
  }

  // Auto-generate reference: RET-2026-XXXX
  const reference = await generateReturnReference();

  // Create request in transaction with initial system note
  const newRequest = await prisma.returnRequest.create({
    data: {
      reference,
      orderId: data.orderId,
      orderItemId: data.orderItemId,
      customerName: data.customerName.trim(),
      customerEmail: data.customerEmail.trim().toLowerCase(),
      customerPhone: data.customerPhone.trim(),
      quantity: requestedQty,
      reason: data.reason,
      description: data.description ? data.description.trim() : null,
      status: RETURN_STATUSES.OPEN,
      notes: {
        create: [
          {
            agentName: data.agentName || 'Support Agent',
            text: data.initialNote || `Return request opened for ${requestedQty}x ${orderItem.productName} due to ${data.reason}.`,
          },
        ],
      },
    },
    include: {
      order: true,
      orderItem: true,
      notes: true,
    },
  });

  return newRequest;
}

/**
 * Update Return Request Status (Enforces Rule 1 & Rule 2)
 */
export async function updateReturnStatus(id, { status: newStatus, resolution, refundAmount, agentName, noteText }) {
  const existing = await prisma.returnRequest.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existing) {
    const error = new Error('Return request not found.');
    error.code = ERROR_CODES.NOT_FOUND;
    error.statusCode = 404;
    throw error;
  }

  // Rule 1: Check lifecycle transition
  const transitionValidation = validateStatusTransition(existing.status, newStatus);
  if (!transitionValidation.isValid) {
    const error = new Error(transitionValidation.message);
    error.code = transitionValidation.code;
    error.statusCode = 400;
    throw error;
  }

  // Rule 2: Check resolution requirement on approval
  const resolutionValidation = validateApprovalResolution(newStatus, resolution, refundAmount);
  if (!resolutionValidation.isValid) {
    const error = new Error(resolutionValidation.message);
    error.code = resolutionValidation.code;
    error.statusCode = 400;
    throw error;
  }

  // Build update payload
  const updatePayload = {
    status: newStatus,
  };

  if (newStatus === RETURN_STATUSES.APPROVED) {
    updatePayload.resolution = resolution;
    if (resolution === 'Refund') {
      updatePayload.refundAmount = parseFloat(refundAmount);
    } else {
      updatePayload.refundAmount = null;
    }
  }

  // Create audit note text
  let auditNote = noteText?.trim();
  if (!auditNote) {
    if (newStatus === RETURN_STATUSES.APPROVED) {
      auditNote = `Status changed to Approved. Resolution: ${resolution}${
        resolution === 'Refund' ? ` (Refund Amount: $${parseFloat(refundAmount).toFixed(2)})` : ''
      }.`;
    } else {
      auditNote = `Status changed from '${existing.status}' to '${newStatus}'.`;
    }
  }

  // Execute in transaction
  const updated = await prisma.$transaction(async (tx) => {
    const req = await tx.returnRequest.update({
      where: { id },
      data: updatePayload,
      include: {
        order: true,
        orderItem: true,
        notes: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    await tx.returnNote.create({
      data: {
        returnRequestId: id,
        agentName: agentName || 'Support Agent',
        text: auditNote,
      },
    });

    return req;
  });

  // Re-fetch with all notes
  return getReturnRequestById(id);
}

/**
 * Update Return Request Details (Enforces Rule 4: Locked after decision)
 */
export async function updateReturnDetails(id, details) {
  const existing = await prisma.returnRequest.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existing) {
    const error = new Error('Return request not found.');
    error.code = ERROR_CODES.NOT_FOUND;
    error.statusCode = 404;
    throw error;
  }

  // Rule 4: Details locked after decision
  const lockCheck = canEditDetails(existing.status);
  if (!lockCheck.canEdit) {
    const error = new Error(lockCheck.message);
    error.code = lockCheck.code;
    error.statusCode = 403;
    throw error;
  }

  // If quantity is modified, validate against purchased quantity
  const updateData = {};
  if (details.customerName !== undefined) updateData.customerName = details.customerName.trim();
  if (details.customerEmail !== undefined) updateData.customerEmail = details.customerEmail.trim();
  if (details.customerPhone !== undefined) updateData.customerPhone = details.customerPhone.trim();
  if (details.reason !== undefined && ALL_RETURN_REASONS.includes(details.reason)) {
    updateData.reason = details.reason;
  }
  if (details.description !== undefined) updateData.description = details.description?.trim();

  if (details.quantity !== undefined) {
    const qty = parseInt(details.quantity, 10);
    const orderItem = await prisma.orderItem.findUnique({ where: { id: existing.orderItemId } });
    if (isNaN(qty) || qty <= 0 || qty > orderItem.quantity) {
      const error = new Error(`Quantity must be between 1 and ${orderItem.quantity}.`);
      error.code = ERROR_CODES.VALIDATION_ERROR;
      error.statusCode = 400;
      throw error;
    }
    updateData.quantity = qty;
  }

  const updated = await prisma.returnRequest.update({
    where: { id },
    data: updateData,
    include: {
      order: true,
      orderItem: true,
      notes: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return updated;
}

/**
 * Add an immutable Note (Section 7: Notes must never be editable or deletable once created)
 */
export async function addReturnNote(returnRequestId, { agentName, text }) {
  if (!text || text.trim().length === 0) {
    const error = new Error('Note text cannot be empty.');
    error.code = ERROR_CODES.VALIDATION_ERROR;
    error.statusCode = 400;
    throw error;
  }

  const existing = await prisma.returnRequest.findFirst({
    where: { id: returnRequestId, deletedAt: null },
  });

  if (!existing) {
    const error = new Error('Return request not found.');
    error.code = ERROR_CODES.NOT_FOUND;
    error.statusCode = 404;
    throw error;
  }

  const note = await prisma.returnNote.create({
    data: {
      returnRequestId,
      agentName: (agentName || 'Support Agent').trim(),
      text: text.trim(),
    },
  });

  return note;
}

/**
 * Soft Removal (Enforces Rule 5: Only Open or Rejected)
 */
export async function softDeleteReturnRequest(id, agentName = 'Support Agent') {
  const existing = await prisma.returnRequest.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existing) {
    const error = new Error('Return request not found.');
    error.code = ERROR_CODES.NOT_FOUND;
    error.statusCode = 404;
    throw error;
  }

  // Rule 5: Can only remove when Open or Rejected
  const deleteCheck = canSoftDelete(existing.status);
  if (!deleteCheck.canDelete) {
    const error = new Error(deleteCheck.message);
    error.code = deleteCheck.code;
    error.statusCode = 400;
    throw error;
  }

  // Soft delete by setting deletedAt
  const now = new Date();
  await prisma.$transaction([
    prisma.returnRequest.update({
      where: { id },
      data: { deletedAt: now },
    }),
    prisma.returnNote.create({
      data: {
        returnRequestId: id,
        agentName,
        text: `Request soft-deleted and removed from active support views.`,
        createdAt: now,
      },
    }),
  ]);

  return { id, reference: existing.reference, deleted: true };
}
