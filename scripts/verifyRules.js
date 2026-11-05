/**
 * Standalone verification script for ReturnDesk Business Rules
 * Tests Rule 1, Rule 2, Rule 4, and Rule 5 validation engines
 */

import {
  validateStatusTransition,
  validateApprovalResolution,
  canEditDetails,
  canSoftDelete,
  validateCreateReturnPayload,
} from '../services/businessRules.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  FAIL: ${testName}`);
  }
}

console.log('====================================================');
console.log('RETURN DESK BUSINESS RULES VALIDATION TEST SUITE');
console.log('====================================================\n');

// --- RULE 1: Status Lifecycle ---
console.log('Testing Rule 1: Status Lifecycle Transitions...');

// Valid transitions
assert(validateStatusTransition('Open', 'In Review').isValid, 'Open -> In Review is allowed');
assert(validateStatusTransition('In Review', 'Approved').isValid, 'In Review -> Approved is allowed');
assert(validateStatusTransition('In Review', 'Rejected').isValid, 'In Review -> Rejected is allowed');
assert(validateStatusTransition('Approved', 'Completed').isValid, 'Approved -> Completed is allowed');

// Invalid transitions
assert(!validateStatusTransition('Open', 'Approved').isValid, 'Open -> Approved is blocked');
assert(!validateStatusTransition('Open', 'Completed').isValid, 'Open -> Completed is blocked');
assert(!validateStatusTransition('Open', 'Rejected').isValid, 'Open -> Rejected is blocked');
assert(!validateStatusTransition('In Review', 'Completed').isValid, 'In Review -> Completed is blocked');
assert(!validateStatusTransition('Approved', 'Rejected').isValid, 'Approved -> Rejected is blocked');
assert(!validateStatusTransition('Approved', 'Open').isValid, 'Approved -> Open is blocked');
assert(!validateStatusTransition('Rejected', 'Open').isValid, 'Rejected is final state (cannot go to Open)');
assert(!validateStatusTransition('Rejected', 'In Review').isValid, 'Rejected is final state (cannot go to In Review)');
assert(!validateStatusTransition('Completed', 'Open').isValid, 'Completed is final state (cannot go to Open)');
assert(!validateStatusTransition('Completed', 'In Review').isValid, 'Completed is final state (cannot go to In Review)');
assert(!validateStatusTransition('Open', 'Open').isValid, 'Transition to same status is blocked');

// --- RULE 2: Approval Requires Resolution ---
console.log('\nTesting Rule 2: Approval Requires Resolution & Refund Amount...');

// Transitions not to Approved should ignore resolution
assert(validateApprovalResolution('In Review', null, null).isValid, 'Resolution check ignored when moving to In Review');
assert(validateApprovalResolution('Completed', null, null).isValid, 'Resolution check ignored when moving to Completed');

// Transitions to Approved
assert(!validateApprovalResolution('Approved', null, null).isValid, 'Approving with null resolution is blocked');
assert(!validateApprovalResolution('Approved', 'InvalidResolution', null).isValid, 'Approving with invalid resolution is blocked');

// Resolution: Refund
assert(!validateApprovalResolution('Approved', 'Refund', null).isValid, 'Refund resolution with null amount is blocked');
assert(!validateApprovalResolution('Approved', 'Refund', 0).isValid, 'Refund resolution with 0 amount is blocked');
assert(!validateApprovalResolution('Approved', 'Refund', -20).isValid, 'Refund resolution with negative amount is blocked');
assert(validateApprovalResolution('Approved', 'Refund', 49.99).isValid, 'Refund resolution with positive amount is allowed');
assert(validateApprovalResolution('Approved', 'Refund', '120.00').isValid, 'Refund resolution with numeric string amount is allowed');

// Resolution: Replacement & Store Credit
assert(validateApprovalResolution('Approved', 'Replacement', null).isValid, 'Replacement resolution with null refund is allowed');
assert(validateApprovalResolution('Approved', 'Store Credit', null).isValid, 'Store Credit resolution with null refund is allowed');
assert(!validateApprovalResolution('Approved', 'Replacement', 50.00).isValid, 'Replacement resolution with refund amount > 0 is blocked');
assert(!validateApprovalResolution('Approved', 'Store Credit', 25.00).isValid, 'Store Credit resolution with refund amount > 0 is blocked');

// --- RULE 4: Lock Details After Decision ---
console.log('\nTesting Rule 4: Lock Details After Decision...');
assert(canEditDetails('Open').canEdit, 'Details are editable when status is Open');
assert(canEditDetails('In Review').canEdit, 'Details are editable when status is In Review');
assert(!canEditDetails('Approved').canEdit, 'Details are locked when status is Approved');
assert(!canEditDetails('Rejected').canEdit, 'Details are locked when status is Rejected');
assert(!canEditDetails('Completed').canEdit, 'Details are locked when status is Completed');

// --- RULE 5: Soft Removal ---
console.log('\nTesting Rule 5: Soft Removal Status Eligibility...');
assert(canSoftDelete('Open').canDelete, 'Soft removal allowed when status is Open');
assert(canSoftDelete('Rejected').canDelete, 'Soft removal allowed when status is Rejected');
assert(!canSoftDelete('In Review').canDelete, 'Soft removal blocked when status is In Review');
assert(!canSoftDelete('Approved').canDelete, 'Soft removal blocked when status is Approved');
assert(!canSoftDelete('Completed').canDelete, 'Soft removal blocked when status is Completed');

// --- CREATE PAYLOAD VALIDATIONS ---
console.log('\nTesting Create Return Payload Validations...');
const validPayload = {
  orderId: 'ORD-2026-1001',
  orderItemId: 'item-123',
  customerName: 'Alex Rivera',
  customerEmail: 'alex@example.com',
  customerPhone: '+1 555-0100',
  quantity: 1,
  reason: 'Damaged',
};
assert(validateCreateReturnPayload(validPayload).isValid, 'Valid payload passes validation');

const invalidEmail = { ...validPayload, customerEmail: 'notanemail' };
assert(!validateCreateReturnPayload(invalidEmail).isValid, 'Invalid email fails validation');

const invalidQty = { ...validPayload, quantity: 0 };
assert(!validateCreateReturnPayload(invalidQty).isValid, 'Zero quantity fails validation');

const invalidReason = { ...validPayload, reason: 'RandomReason' };
assert(!validateCreateReturnPayload(invalidReason).isValid, 'Invalid reason fails validation');

console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} PASSED`);
console.log('====================================================');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
