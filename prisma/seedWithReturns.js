const { PrismaClient } = require('@prisma/client');
const { mockOrders } = require('./seedData');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting ReturnDesk Full Seeding (Orders + 34 Returns) ---');

  console.log('Cleaning existing database records...');
  await prisma.returnNote.deleteMany({});
  await prisma.returnRequest.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});

  console.log('Seeding 10 Indian mock orders and products...');
  const createdOrders = [];
  const createdItems = [];

  for (const o of mockOrders) {
    const order = await prisma.order.create({
      data: {
        id: o.id,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
        orderDate: o.orderDate,
        status: o.status,
        totalAmount: o.totalAmount,
        items: {
          create: o.items.map((item) => ({
            productName: item.productName,
            sku: item.sku,
            imageUrl: item.imageUrl,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    createdOrders.push(order);
    createdItems.push(...order.items);
  }

  const returnRequestsData = [
    {
      refSuffix: '0001',
      itemIndex: 0,
      quantity: 1,
      reason: 'Size Issue',
      description: 'Insoles are slightly broader than shoe toe box for formal loafers. Requesting replacement guide or smaller size.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [{ agentName: 'Rahul Sharma (Customer Portal)', text: 'Return request submitted via Frido online customer portal.' }],
      createdAt: new Date('2026-02-16T11:00:00Z'),
    },
    {
      refSuffix: '0002',
      itemIndex: 1,
      quantity: 1,
      reason: 'Not As Described',
      description: 'Cushion foam density is softer than expected for lower back sciatica pain relief.',
      status: 'In Review',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Priya Sharma', text: 'Called customer to understand seat height setup. Recommending firmer orthotic variant.' },
        { agentName: 'Agent Priya Sharma', text: 'Customer willing to try firm edition exchange.' },
      ],
      createdAt: new Date('2026-02-17T09:30:00Z'),
    },
    {
      refSuffix: '0003',
      itemIndex: 2,
      quantity: 1,
      reason: 'Damaged',
      description: 'Right shoulder strap velcro buckle arrived torn in packaging.',
      status: 'Approved',
      resolution: 'Refund',
      refundAmount: 1299.00,
      notes: [{ agentName: 'Agent Rajesh Kumar', text: 'Defect photos verified. Approved full refund of ₹1,299 to original UPI account.' }],
      createdAt: new Date('2026-02-18T14:20:00Z'),
    },
    {
      refSuffix: '0004',
      itemIndex: 3,
      quantity: 1,
      reason: 'Damaged',
      description: 'Right ear cup static buzzing sound when active noise cancellation is switched on.',
      status: 'Completed',
      resolution: 'Replacement',
      refundAmount: null,
      notes: [
        { agentName: 'Agent Sneha Rao', text: 'Courier pickup scheduled with Bluedart Air.' },
        { agentName: 'Agent Sneha Rao', text: 'Brand new sealed unit delivered. Customer confirmed audio is crystal clear. Ticket closed.' },
      ],
      createdAt: new Date('2026-02-20T10:15:00Z'),
    },
    {
      refSuffix: '0005',
      itemIndex: 4,
      quantity: 1,
      reason: 'Wrong Item',
      description: 'Received USB-A to Type-C cable instead of dual Type-C 65W fast charger cables.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [{ agentName: 'Support Bot', text: 'Initial request logged. Awaiting agent assignment.' }],
      createdAt: new Date('2026-02-22T16:00:00Z'),
    },
    {
      refSuffix: '0006',
      itemIndex: 5,
      quantity: 1,
      reason: 'Changed Mind',
      description: 'Customer found cheaper third-party sleeve on local market after using this for 25 days.',
      status: 'Rejected',
      resolution: null,
      refundAmount: null,
      notes: [{ agentName: 'Agent Rajesh Kumar', text: 'Item returned past the 14-day return window with clear exterior scuff marks. Decline return.' }],
      createdAt: new Date('2026-02-23T11:45:00Z'),
    },
  ];

  for (const r of returnRequestsData) {
    const item = createdItems[r.itemIndex];
    const order = createdOrders.find((o) => o.id === item.orderId);
    const ref = `RET-2026-${r.refSuffix}`;

    await prisma.returnRequest.create({
      data: {
        reference: ref,
        orderId: order.id,
        orderItemId: item.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        quantity: r.quantity,
        reason: r.reason,
        description: r.description,
        status: r.status,
        resolution: r.resolution,
        refundAmount: r.refundAmount !== null ? r.refundAmount : undefined,
        deletedAt: null,
        createdAt: r.createdAt,
        notes: {
          create: r.notes.map((n) => ({
            agentName: n.agentName,
            text: n.text,
            createdAt: r.createdAt,
          })),
        },
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
