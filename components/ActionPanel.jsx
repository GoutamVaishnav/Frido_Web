'use client';

import React, { useState } from 'react';
import {
  ArrowRightCircle,
  CheckCircle2,
  XCircle,
  CheckCheck,
  Trash2,
  AlertCircle,
  HelpCircle,
  DollarSign,
} from 'lucide-react';
import {
  RETURN_STATUSES,
  RESOLUTIONS,
  ALL_RESOLUTIONS,
  FINAL_STATUSES,
  DELETABLE_STATUSES,
} from '@/lib/constants';
import { Modal } from './Modal';
import { useToast } from '@/hooks/useToast';

export function ActionPanel({ returnRequest, onStatusUpdated, onDeleted }) {
  const { success, error } = useToast();
  const [activeModal, setActiveModal] = useState(null); // 'review' | 'approve' | 'reject' | 'complete' | 'delete' | null
  const [loading, setLoading] = useState(false);

  // Form states for Approval (Rule 2)
  const [resolution, setResolution] = useState(RESOLUTIONS.REFUND);
  const [refundAmount, setRefundAmount] = useState(
    returnRequest?.orderItem?.unitPrice
      ? (parseFloat(returnRequest.orderItem.unitPrice) * returnRequest.quantity).toFixed(2)
      : ''
  );
  const [noteText, setNoteText] = useState('');
  const [agentName, setAgentName] = useState('Agent Priya Sharma');

  const currentStatus = returnRequest?.status;
  const isFinal = FINAL_STATUSES.includes(currentStatus);
  const canDelete = DELETABLE_STATUSES.includes(currentStatus);

  // Transition handler
  async function handleStatusChange(targetStatus, extraData = {}) {
    setLoading(true);
    try {
      const res = await fetch(`/api/returns/${returnRequest.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          agentName,
          noteText: noteText.trim() || undefined,
          ...extraData,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to update request status.');
      }

      success(`Status successfully updated to ${targetStatus}`);
      setActiveModal(null);
      setNoteText('');
      if (onStatusUpdated) onStatusUpdated(json.data);
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Soft delete handler (Rule 5)
  async function handleSoftDelete() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/returns/${returnRequest.id}?agentName=${encodeURIComponent(agentName)}`,
        {
          method: 'DELETE',
        }
      );

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to remove request.');
      }

      success(`Return request ${returnRequest.reference} removed.`);
      setActiveModal(null);
      if (onDeleted) onDeleted();
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Agent Actions
          </h3>
          <p className="text-xs text-slate-500">
            Available actions strictly regulated for status: <span className="font-semibold">{currentStatus}</span>
          </p>
        </div>
      </div>

      {/* Action Buttons based on Current Status */}
      <div className="flex flex-wrap gap-2.5">
        {/* Open -> In Review */}
        {currentStatus === RETURN_STATUSES.OPEN && (
          <button
            onClick={() => setActiveModal('review')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <ArrowRightCircle className="w-4 h-4" />
            <span>Move to In Review</span>
          </button>
        )}

        {/* In Review -> Approved or Rejected */}
        {currentStatus === RETURN_STATUSES.IN_REVIEW && (
          <>
            <button
              onClick={() => setActiveModal('approve')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Request...</span>
            </button>

            <button
              onClick={() => setActiveModal('reject')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Request...</span>
            </button>
          </>
        )}

        {/* Approved -> Completed */}
        {currentStatus === RETURN_STATUSES.APPROVED && (
          <button
            onClick={() => setActiveModal('complete')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark as Completed</span>
          </button>
        )}

        {/* Terminal state message */}
        {isFinal && (
          <div className="text-xs text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
            Request is in terminal state ({currentStatus}). No further status transitions allowed.
          </div>
        )}

        {/* Soft Delete Action (Rule 5: Only Open or Rejected) */}
        {canDelete && (
          <button
            onClick={() => setActiveModal('delete')}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Soft Remove</span>
          </button>
        )}
      </div>

      {/* Modal: Move to In Review */}
      <Modal
        isOpen={activeModal === 'review'}
        onClose={() => setActiveModal(null)}
        title="Move to In Review"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Transitioning this return request to <strong>In Review</strong> assigns it to your queue for investigation and triage.
          </p>
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Add Investigation Note (Optional)
            </label>
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Verified customer proof of defect. Reviewing warehouse dispatch lot..."
              className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setActiveModal(null)}
              className="px-3 py-1.5 border rounded-xl text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={() => handleStatusChange(RETURN_STATUSES.IN_REVIEW)}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Confirm In Review'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Approve Request (Rule 2) */}
      <Modal
        isOpen={activeModal === 'approve'}
        onClose={() => setActiveModal(null)}
        title="Approve Return Request"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
            <p className="font-semibold mb-0.5">Policy Requirement (Rule 2)</p>
            <p>
              Approval requires choosing a valid resolution. If Refund is selected, a valid refund amount greater than $0.00 is strictly required.
            </p>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Resolution Method <span className="text-rose-500">*</span>
            </label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              {ALL_RESOLUTIONS.map((res) => (
                <option key={res} value={res}>
                  {res}
                </option>
              ))}
            </select>
          </div>

          {resolution === RESOLUTIONS.REFUND && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Refund Amount (₹ INR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-7 pr-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Approval Note (Optional)
            </label>
            <textarea
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Return shipping label sent to customer email."
              className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setActiveModal(null)}
              className="px-3 py-1.5 border rounded-xl text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              disabled={loading || (resolution === RESOLUTIONS.REFUND && (!refundAmount || parseFloat(refundAmount) <= 0))}
              onClick={() =>
                handleStatusChange(RETURN_STATUSES.APPROVED, {
                  resolution,
                  refundAmount: resolution === RESOLUTIONS.REFUND ? parseFloat(refundAmount) : null,
                })
              }
              className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Approving...' : 'Approve & Confirm'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Reject Request */}
      <Modal
        isOpen={activeModal === 'reject'}
        onClose={() => setActiveModal(null)}
        title="Reject Return Request"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200">
            <p className="font-semibold mb-0.5">Terminal Transition Warning</p>
            <p>
              Once a request is Rejected, it reaches a final state and cannot be transitioned back to Open or Approved.
            </p>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Reason for Rejection (Recorded in Notes) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Explain why this request is being declined (e.g., item outside return window, accidental damage not covered by warranty)..."
              className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setActiveModal(null)}
              className="px-3 py-1.5 border rounded-xl text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              disabled={loading || !noteText.trim()}
              onClick={() => handleStatusChange(RETURN_STATUSES.REJECTED)}
              className="px-4 py-1.5 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Complete Request */}
      <Modal
        isOpen={activeModal === 'complete'}
        onClose={() => setActiveModal(null)}
        title="Complete Return Request"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Confirm that the return package was received at the warehouse or the replacement/refund was successfully dispatched to customer.
          </p>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Closing Note (Optional)
            </label>
            <textarea
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Warehouse receipt confirmed. Refund transaction ID #TX98201."
              className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setActiveModal(null)}
              className="px-3 py-1.5 border rounded-xl text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={() => handleStatusChange(RETURN_STATUSES.COMPLETED)}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Closing...' : 'Close & Complete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Soft Delete Confirmation (Rule 5) */}
      <Modal
        isOpen={activeModal === 'delete'}
        onClose={() => setActiveModal(null)}
        title="Remove Return Request"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
            <p className="font-semibold mb-0.5">Soft Removal (Rule 5)</p>
            <p>
              This request will be marked as soft-deleted in Neon PostgreSQL. It will be hidden from all active tables and detail pages, while preserving database integrity.
            </p>
          </div>

          <p className="text-slate-600">
            Are you sure you want to remove request <strong>{returnRequest?.reference}</strong>?
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setActiveModal(null)}
              className="px-3 py-1.5 border rounded-xl text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={handleSoftDelete}
              className="px-4 py-1.5 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Removing...' : 'Confirm Soft Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

