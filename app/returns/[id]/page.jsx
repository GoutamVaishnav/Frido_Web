import React from 'react';
import { notFound } from 'next/navigation';
import { getReturnRequestById } from '@/services/returnService';
import { ReturnDetailsView } from './ReturnDetailsView';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = params;
  try {
    const returnRequest = await getReturnRequestById(id);
    if (!returnRequest) return { title: 'Return Request Not Found — ReturnDesk' };
    return {
      title: `${returnRequest.reference} — ReturnDesk`,
      description: `Support triage and resolution details for return request ${returnRequest.reference}`,
    };
  } catch (e) {
    return { title: 'Return Request Details — ReturnDesk' };
  }
}

export default async function ReturnDetailPage({ params }) {
  const { id } = params;

  let returnRequest = null;
  try {
    returnRequest = await getReturnRequestById(id);
  } catch (err) {
    console.error('Error fetching return request:', err);
    notFound();
  }

  if (!returnRequest) {
    notFound();
  }

  // Serialize Decimal objects to string/number if needed for client component props
  const serialized = {
    ...returnRequest,
    refundAmount: returnRequest.refundAmount ? parseFloat(returnRequest.refundAmount.toString()) : null,
    createdAt: returnRequest.createdAt.toISOString(),
    updatedAt: returnRequest.updatedAt.toISOString(),
    order: {
      ...returnRequest.order,
      totalAmount: parseFloat(returnRequest.order.totalAmount.toString()),
      orderDate: returnRequest.order.orderDate.toISOString(),
      createdAt: returnRequest.order.createdAt.toISOString(),
      updatedAt: returnRequest.order.updatedAt.toISOString(),
    },
    orderItem: {
      ...returnRequest.orderItem,
      unitPrice: parseFloat(returnRequest.orderItem.unitPrice.toString()),
      createdAt: returnRequest.orderItem.createdAt.toISOString(),
      updatedAt: returnRequest.orderItem.updatedAt.toISOString(),
    },
    notes: returnRequest.notes.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    })),
  };

  return <ReturnDetailsView initialData={serialized} />;
}

