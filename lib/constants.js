/**
 * Application Constants
 * Strict enums and mappings for ReturnDesk
 */

export const RETURN_STATUSES = {
  OPEN: 'Open',
  IN_REVIEW: 'In Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
};

export const ALL_RETURN_STATUSES = [
  RETURN_STATUSES.OPEN,
  RETURN_STATUSES.IN_REVIEW,
  RETURN_STATUSES.APPROVED,
  RETURN_STATUSES.REJECTED,
  RETURN_STATUSES.COMPLETED,
];

// Live statuses for Rule 3 (no duplicate live requests on same item)
export const LIVE_STATUSES = [
  RETURN_STATUSES.OPEN,
  RETURN_STATUSES.IN_REVIEW,
  RETURN_STATUSES.APPROVED,
];

// Final statuses
export const FINAL_STATUSES = [
  RETURN_STATUSES.REJECTED,
  RETURN_STATUSES.COMPLETED,
];

// Statuses where details are locked (Rule 4)
export const LOCKED_STATUSES = [
  RETURN_STATUSES.APPROVED,
  RETURN_STATUSES.REJECTED,
  RETURN_STATUSES.COMPLETED,
];

// Statuses where soft-delete is allowed (Rule 5)
export const DELETABLE_STATUSES = [
  RETURN_STATUSES.OPEN,
  RETURN_STATUSES.REJECTED,
];

// Return reasons (exact list specified in requirements)
export const RETURN_REASONS = {
  DAMAGED: 'Damaged',
  WRONG_ITEM: 'Wrong Item',
  SIZE_ISSUE: 'Size Issue',
  NOT_AS_DESCRIBED: 'Not As Described',
  CHANGED_MIND: 'Changed Mind',
};

export const ALL_RETURN_REASONS = [
  RETURN_REASONS.DAMAGED,
  RETURN_REASONS.WRONG_ITEM,
  RETURN_REASONS.SIZE_ISSUE,
  RETURN_REASONS.NOT_AS_DESCRIBED,
  RETURN_REASONS.CHANGED_MIND,
];

// Resolution options
export const RESOLUTIONS = {
  REFUND: 'Refund',
  REPLACEMENT: 'Replacement',
  STORE_CREDIT: 'Store Credit',
};

export const ALL_RESOLUTIONS = [
  RESOLUTIONS.REFUND,
  RESOLUTIONS.REPLACEMENT,
  RESOLUTIONS.STORE_CREDIT,
];

// UI Badge color styles
export const STATUS_CONFIG = {
  [RETURN_STATUSES.OPEN]: {
    label: 'Open',
    color: 'amber',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    description: 'Request received and awaiting initial agent triage',
  },
  [RETURN_STATUSES.IN_REVIEW]: {
    label: 'In Review',
    color: 'blue',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    description: 'Under investigation by support agent',
  },
  [RETURN_STATUSES.APPROVED]: {
    label: 'Approved',
    color: 'emerald',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    description: 'Decision made to proceed with resolution',
  },
  [RETURN_STATUSES.REJECTED]: {
    label: 'Rejected',
    color: 'rose',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    description: 'Request declined per company policy',
  },
  [RETURN_STATUSES.COMPLETED]: {
    label: 'Completed',
    color: 'slate',
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-500',
    description: 'Resolution fulfilled and closed',
  },
};

export const REASON_CONFIG = {
  [RETURN_REASONS.DAMAGED]: {
    label: 'Damaged',
    badge: 'bg-red-50 text-red-700 border-red-200',
  },
  [RETURN_REASONS.WRONG_ITEM]: {
    label: 'Wrong Item',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  [RETURN_REASONS.SIZE_ISSUE]: {
    label: 'Size Issue',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  [RETURN_REASONS.NOT_AS_DESCRIBED]: {
    label: 'Not As Described',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  [RETURN_REASONS.CHANGED_MIND]: {
    label: 'Changed Mind',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
  },
};

