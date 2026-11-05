'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Phone,
  Package,
  RotateCcw,
  ShieldCheck,
  Lock,
  Edit2,
  DollarSign,
  AlertTriangle,
  Receipt,
  FileText,
} from 'lucide-react';
import { StatusBadge, ReasonBadge, ResolutionBadge } from '@/components/Badge';
import { StatusTimeline } from '@/components/Timeline';
import { ActionPanel } from '@/components/ActionPanel';
import { NotesSection } from '@/components/NotesSection';
import { Modal } from '@/components/Modal';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import { LOCKED_STATUSES, ALL_RETURN_REASONS } from '@/lib/constants';
import { useToast } from '@/hooks/useToast';

export function ReturnDetailsView({ initialData }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [request, setRequest] = useState(initialData);

  // Edit details state (Rule 4: locked once Approved, Rejected, or Completed)
  const isLocked = LOCKED_STATUSES.includes(request.status);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    customerName: request.customerName,
    customerEmail: request.customerEmail,
    customerPhone: request.customerPhone,
    quantity: request.quantity,
    reason: request.reason,
    description: request.description || '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Status transition callback
  function handleStatusUpdated(updatedRequest) {
    setRequest(updatedRequest);
  }

  // Soft delete callback -> redirect to returns list
  function handleDeleted() {
    router.push('/returns');
  }

  // Note added callback
  function handleNoteAdded(newNote) {
    setRequest((prev) => ({
      ...prev,
      notes: [...(prev.notes || []), newNote],
    }));
  }

  // Save edited details (Rule 4 check)
  async function handleSaveDetails(e) {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/returns/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to update details.');
      }

      success('Request details updated successfully.');
      setRequest(json.data);
      setIsEditModalOpen(false);
    } catch (err) {
      error(err.message);
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/returns"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Returns</span>
        </Link>

        <div className="flex items-center gap-2">
          {isLocked ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Details Locked (Rule 4)</span>
            </span>
          ) : (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Edit2 className="w-3 h-3 text-slate-500" />
              <span>Edit Details</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Reference Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono tracking-tight text-slate-900">
                {request.reference}
              </h1>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Created on {formatDateTime(request.createdAt)}
            </p>
          </div>

          {/* Resolution Badge if Approved or Completed */}
          {request.resolution && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-left sm:text-right">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                Resolution: {request.resolution}
              </span>
              {request.refundAmount && (
                <span className="text-base font-bold font-mono text-emerald-900 block mt-0.5">
                  Refund: {formatCurrency(request.refundAmount)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Visual Lifecycle Timeline */}
        <div className="pt-6">
          <StatusTimeline currentStatus={request.status} />
        </div>
      </div>

      {/* Action Panel (Enforcing Rule 1, Rule 2, Rule 5) */}
      <ActionPanel
        returnRequest={request}
        onStatusUpdated={handleStatusUpdated}
        onDeleted={handleDeleted}
      />

      {/* Details Grid: Customer Info & Product Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Customer Information Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Customer Information
            </h3>
            {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Name</span>
              <span className="font-semibold text-slate-900">{request.customerName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Email</span>
              <a href={`mailto:${request.customerEmail}`} className="text-emerald-600 font-medium hover:underline">
                {request.customerEmail}
              </a>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Phone</span>
              <span className="font-medium text-slate-900">{request.customerPhone}</span>
            </div>
          </div>
        </div>

        {/* Order & Return Item Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              Order & Product Details
            </h3>
            <Link
              href={`/orders/${request.orderId}`}
              className="text-xs font-mono font-semibold text-emerald-600 hover:underline"
            >
              Order: {request.orderId} →
            </Link>
          </div>

          <div className="flex items-start gap-4">
            {request.orderItem?.imageUrl ? (
              <img
                src={request.orderItem.imageUrl}
                alt=""
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
              />
            ) : null}

            <div className="flex-1 min-w-0 text-xs space-y-1">
              <div className="font-semibold text-slate-900 truncate">
                {request.orderItem?.productName || 'Purchased Line Item'}
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                SKU: {request.orderItem?.sku}
              </div>
              <div className="flex items-center gap-2 text-slate-600 pt-1">
                <span>Returning: <strong className="text-slate-900">{request.quantity}</strong> item(s)</span>
                <span>•</span>
                <span>Purchased: <strong className="text-slate-900">{request.orderItem?.quantity}</strong></span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Return Reason</span>
              <div className="mt-1">
                <ReasonBadge reason={request.reason} />
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Unit Price</span>
              <span className="font-mono font-bold text-slate-900">
                {formatCurrency(request.orderItem?.unitPrice)}
              </span>
            </div>
          </div>

          {request.description && (
            <div className="pt-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-700 block mb-0.5">
                Customer Description:
              </span>
              <p className="text-slate-600 italic leading-relaxed">
                &ldquo;{request.description}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Immutable Notes Section (Section 7) */}
      <NotesSection
        returnRequestId={request.id}
        notes={request.notes || []}
        onNoteAdded={handleNoteAdded}
      />

      {/* Modal: Edit Details (Only allowed when Open or In Review per Rule 4) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Return Details"
      >
        <form onSubmit={handleSaveDetails} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Customer Full Name
            </label>
            <input
              type="text"
              required
              value={editFormData.customerName}
              onChange={(e) =>
                setEditFormData({ ...editFormData, customerName: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Customer Email
              </label>
              <input
                type="email"
                required
                value={editFormData.customerEmail}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, customerEmail: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Customer Phone
              </label>
              <input
                type="tel"
                required
                value={editFormData.customerPhone}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, customerPhone: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Quantity to Return (Max: {request.orderItem?.quantity})
              </label>
              <input
                type="number"
                min={1}
                max={request.orderItem?.quantity || 1}
                required
                value={editFormData.quantity}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    quantity: parseInt(e.target.value, 10) || 1,
                  })
                }
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Return Reason
              </label>
              <select
                value={editFormData.reason}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, reason: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                {ALL_RETURN_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={editFormData.description}
              onChange={(e) =>
                setEditFormData({ ...editFormData, description: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-3 py-1.5 border rounded-xl text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingEdit}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl disabled:opacity-50"
            >
              {savingEdit ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
