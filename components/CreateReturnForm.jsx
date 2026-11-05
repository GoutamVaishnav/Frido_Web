'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  RotateCcw,
  User,
  Mail,
  Phone,
  Package,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { ALL_RETURN_REASONS } from '@/lib/constants';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/utils/formatters';

export function CreateReturnForm({ initialOrders = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useToast();

  const prefillOrderId = searchParams.get('orderId') || '';
  const prefillItemId = searchParams.get('itemId') || '';
  const prefillCustomerName = searchParams.get('customerName') || '';
  const prefillCustomerEmail = searchParams.get('customerEmail') || '';
  const prefillCustomerPhone = searchParams.get('customerPhone') || '';

  // Orders list for selection if not prefilled
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrderId, setSelectedOrderId] = useState(prefillOrderId);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(prefillItemId);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form inputs
  const [customerName, setCustomerName] = useState(prefillCustomerName);
  const [customerEmail, setCustomerEmail] = useState(prefillCustomerEmail);
  const [customerPhone, setCustomerPhone] = useState(prefillCustomerPhone);
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState(ALL_RETURN_REASONS[0]);
  const [description, setDescription] = useState('');
  const [agentName, setAgentName] = useState('Agent Priya Sharma');

  const [loadingOrders, setLoadingOrders] = useState(orders.length === 0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Load orders if not supplied as props
  useEffect(() => {
    if (orders.length === 0) {
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrders(data.data);
          }
        })
        .finally(() => setLoadingOrders(false));
    }
  }, [orders.length]);

  // When selectedOrderId changes, update selectedOrder and autofill customer info if empty
  useEffect(() => {
    if (selectedOrderId && orders.length > 0) {
      const ord = orders.find((o) => o.id === selectedOrderId);
      if (ord) {
        setSelectedOrder(ord);
        if (!customerName) setCustomerName(ord.customerName);
        if (!customerEmail) setCustomerEmail(ord.customerEmail);
        if (!customerPhone) setCustomerPhone(ord.customerPhone);

        // If prefillItemId matches an item in this order, select it
        if (selectedItemId) {
          const itm = ord.items?.find((i) => i.id === selectedItemId);
          if (itm) setSelectedItem(itm);
        } else if (ord.items && ord.items.length > 0) {
          setSelectedItemId(ord.items[0].id);
          setSelectedItem(ord.items[0]);
        }
      }
    }
  }, [selectedOrderId, orders, selectedItemId, customerName, customerEmail, customerPhone]);

  // When selectedItemId changes, update selectedItem
  useEffect(() => {
    if (selectedOrder && selectedItemId) {
      const itm = selectedOrder.items?.find((i) => i.id === selectedItemId);
      if (itm) {
        setSelectedItem(itm);
        // Ensure quantity does not exceed item purchased quantity
        if (quantity > itm.quantity) {
          setQuantity(itm.quantity);
        }
      }
    }
  }, [selectedItemId, selectedOrder, quantity]);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    // Frontend validations
    if (!selectedOrderId) {
      setFormError('Please select an order.');
      return;
    }
    if (!selectedItemId) {
      setFormError('Please select a purchased order item.');
      return;
    }
    if (!customerName.trim()) {
      setFormError('Customer name is required.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setFormError('A valid customer email is required.');
      return;
    }
    if (!customerPhone.trim()) {
      setFormError('Customer phone is required.');
      return;
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setFormError('Quantity to return must be at least 1.');
      return;
    }
    if (selectedItem && qty > selectedItem.quantity) {
      setFormError(`Quantity cannot exceed purchased quantity (${selectedItem.quantity}).`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderId,
          orderItemId: selectedItemId,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          quantity: qty,
          reason,
          description: description.trim() || null,
          agentName: agentName.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to submit return request.');
      }

      success(`Return request ${json.data.reference} created successfully! Initial status: Open.`);
      // Redirect to the request details page per Section 5
      router.push(`/returns/${json.data.id}`);
    } catch (err) {
      setFormError(err.message);
      error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Top Breadcrumb & Cancel Action */}
      <div className="flex items-center justify-between">
        <Link
          href="/returns"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Return Requests</span>
        </Link>
        <span className="text-xs text-slate-400 font-mono">
          Ref ID will be auto-generated upon submission
        </span>
      </div>

      {formError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{formError}</div>
        </div>
      )}

      {/* Section 1: Customer Information */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              1. Customer Information
            </h3>
            <p className="text-xs text-slate-500">
              Contact credentials for return notifications and logistics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Customer Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Customer Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="rahul.sharma@gmail.com"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Customer Phone <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+91 98201 23456"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Order & Product Information */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              2. Order & Purchased Item Selection
            </h3>
            <p className="text-xs text-slate-500">
              Select the mock order and product item to be returned
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Select Order ID <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => {
                setSelectedOrderId(e.target.value);
                setSelectedItemId('');
                setSelectedItem(null);
              }}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="">-- Choose an Order --</option>
              {orders.map((ord) => (
                <option key={ord.id} value={ord.id}>
                  {ord.id} — {ord.customerName} ({ord.items?.length || 0} items)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Select Product Item <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              disabled={!selectedOrderId || !selectedOrder?.items?.length}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 cursor-pointer"
            >
              <option value="">-- Choose a Product --</option>
              {selectedOrder?.items?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.productName} (SKU: {item.sku}, Purchased: {item.quantity})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Product Card Summary */}
        {selectedItem && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-4 text-xs">
            {selectedItem.imageUrl ? (
              <img
                src={selectedItem.imageUrl}
                alt=""
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
              />
            ) : null}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 truncate">
                {selectedItem.productName}
              </div>
              <div className="flex flex-wrap gap-3 mt-1 text-slate-500">
                <span className="font-mono">SKU: {selectedItem.sku}</span>
                <span>•</span>
                <span>Unit Price: {formatCurrency(selectedItem.unitPrice)}</span>
                <span>•</span>
                <span>
                  Quantity Purchased:{' '}
                  <strong className="text-slate-800">{selectedItem.quantity}</strong>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Return Information */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              3. Return Details & Reason
            </h3>
            <p className="text-xs text-slate-500">
              Specify quantity to return and precise reason
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Quantity to Return <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={selectedItem?.quantity || 1}
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            {selectedItem && (
              <p className="text-[11px] text-slate-400 mt-1">
                Max returnable quantity for this line item is {selectedItem.quantity}.
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Return Reason <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
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
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Additional Customer Description / Defect Details
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what went wrong, packaging condition, or customer feedback..."
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Submit Action Bar */}
      <div className="flex items-center justify-between p-6 bg-slate-900 rounded-2xl text-white">
        <div>
          <h4 className="text-xs font-semibold">Ready to Submit</h4>
          <p className="text-[11px] text-slate-400">
            Initial status will be set to <strong>Open</strong>. Human-readable reference auto-generated.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{submitting ? 'Creating Request...' : 'Submit Return Request'}</span>
        </button>
      </div>
    </form>
  );
}

