const { PrismaClient } = require('@prisma/client');
const { mockOrders } = require('./seedData');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting ReturnDesk Indian Dataset Seeding ---');

  // Clear existing records if needed (in cascade order)
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

  console.log(`Created ${createdOrders.length} orders with ${createdItems.length} order items.`);

  // 34 realistic return requests based on Indian e-commerce support scenarios
  // Enforcing Rule 3: Single live request per order item (Live: Open, In Review, Approved)
  // Enforcing Rule 2: Approval requires resolution (Refund requires refundAmount > 0)
  // Enforcing Rule 5: Soft delete sample

  const returnRequestsData = [
    // 1: Open
    {
      refSuffix: '0001',
      itemIndex: 0, // Frido Dual-Gel Insoles (ORD-1001)
      quantity: 1,
      reason: 'Size Issue',
      description: 'Insoles are slightly broader than shoe toe box for formal loafers. Requesting replacement guide or smaller size.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Rahul Sharma (Customer Portal)', text: 'Return request submitted via Frido online customer portal.' },
      ],
      createdAt: new Date('2026-02-16T11:00:00Z'),
    },
    // 2: In Review
    {
      refSuffix: '0002',
      itemIndex: 1, // Frido Coccyx Cushion (ORD-1001)
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
    // 3: Approved (Refund)
    {
      refSuffix: '0003',
      itemIndex: 2, // Frido Posture Corrector (ORD-1001)
      quantity: 1,
      reason: 'Damaged',
      description: 'Right shoulder strap velcro buckle arrived torn in packaging.',
      status: 'Approved',
      resolution: 'Refund',
      refundAmount: 1299.00,
      notes: [
        { agentName: 'Agent Rajesh Kumar', text: 'Defect photos verified. Approved full refund of ₹1,299 to original UPI account.' },
      ],
      createdAt: new Date('2026-02-18T14:20:00Z'),
    },
    // 4: Completed (Replacement)
    {
      refSuffix: '0004',
      itemIndex: 3, // Headphones (ORD-1002)
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
    // 5: Open
    {
      refSuffix: '0005',
      itemIndex: 4, // Type-C Cables (ORD-1002)
      quantity: 1,
      reason: 'Wrong Item',
      description: 'Received USB-A to Type-C cable instead of dual Type-C 65W fast charger cables.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Support Bot', text: 'Initial request logged. Awaiting agent assignment.' },
      ],
      createdAt: new Date('2026-02-22T16:00:00Z'),
    },
    // 6: Rejected
    {
      refSuffix: '0006',
      itemIndex: 5, // Headphone Case (ORD-1002)
      quantity: 1,
      reason: 'Changed Mind',
      description: 'Customer found cheaper third-party sleeve on local market after using this for 25 days.',
      status: 'Rejected',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Rajesh Kumar', text: 'Item returned past the 14-day return window with clear exterior scuff marks. Decline return.' },
      ],
      createdAt: new Date('2026-02-23T11:45:00Z'),
    },
    // 7: Open
    {
      refSuffix: '0007',
      itemIndex: 6, // Mech Keyboard (ORD-1003)
      quantity: 1,
      reason: 'Damaged',
      description: 'Spacebar key switch double-registers when typed at speed.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Rohan Verma', text: 'Requested video demonstration from customer.' },
      ],
      createdAt: new Date('2026-02-24T13:10:00Z'),
    },
    // 8: Approved (Store Credit)
    {
      refSuffix: '0008',
      itemIndex: 7, // Vertical Mouse (ORD-1003)
      quantity: 1,
      reason: 'Changed Mind',
      description: 'Takes time getting used to vertical grip angle, prefers regular gaming mouse.',
      status: 'Approved',
      resolution: 'Store Credit',
      refundAmount: null,
      notes: [
        { agentName: 'Agent Priya Sharma', text: 'Approved ₹1,899 Frido store credit voucher for future accessories.' },
      ],
      createdAt: new Date('2026-02-25T15:20:00Z'),
    },
    // 9: Completed (Refund)
    {
      refSuffix: '0009',
      itemIndex: 8, // Desk Blotter Mat (ORD-1003)
      quantity: 1,
      reason: 'Not As Described',
      description: 'Mat dimensions do not match desk space listed on website.',
      status: 'Completed',
      resolution: 'Refund',
      refundAmount: 999.00,
      notes: [
        { agentName: 'Agent Rajesh Kumar', text: 'Return package received at warehouse. Full refund of ₹999 processed to HDFC Netbanking.' },
      ],
      createdAt: new Date('2026-02-26T17:00:00Z'),
    },
    // 10: In Review
    {
      refSuffix: '0010',
      itemIndex: 9, // Frido Cervical Pillow (ORD-1004)
      quantity: 1,
      reason: 'Size Issue',
      description: 'Pillow loft height of 4 inches is too elevated for stomach sleeping position.',
      status: 'In Review',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Sneha Rao', text: 'Reviewing ergonomic adjustment inserts to assist customer.' },
      ],
      createdAt: new Date('2026-02-27T10:00:00Z'),
    },
    // 11: Approved (Replacement)
    {
      refSuffix: '0011',
      itemIndex: 10, // Silk Pillowcase (ORD-1004)
      quantity: 1,
      reason: 'Wrong Item',
      description: 'Received Champagne Gold instead of Pearl White ordered.',
      status: 'Approved',
      resolution: 'Replacement',
      refundAmount: null,
      notes: [
        { agentName: 'Agent Priya Sharma', text: 'Warehouse dispatch error confirmed. Dispatched correct Pearl White color.' },
      ],
      createdAt: new Date('2026-02-28T14:30:00Z'),
    },
    // 12: Rejected
    {
      refSuffix: '0012',
      itemIndex: 11, // Lavender Mist (ORD-1004)
      quantity: 1,
      reason: 'Changed Mind',
      description: 'Personal care cosmetic spray bottle opened and half consumed.',
      status: 'Rejected',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Sneha Rao', text: 'Cosmetic and wellness liquid products cannot be returned once security seal is broken.' },
      ],
      createdAt: new Date('2026-03-01T12:00:00Z'),
    },
    // 13: Completed (Refund)
    {
      refSuffix: '0013',
      itemIndex: 12, // Running Shoes (ORD-1005)
      quantity: 1,
      reason: 'Size Issue',
      description: 'UK 9 is too tight across broad Indian toe profile.',
      status: 'Completed',
      resolution: 'Refund',
      refundAmount: 3499.00,
      notes: [
        { agentName: 'Agent Rohan Verma', text: 'Customer opted for refund as UK 10 was temporarily out of stock.' },
        { agentName: 'Agent Rohan Verma', text: '₹3,499 refunded to original card via Razorpay.' },
      ],
      createdAt: new Date('2026-03-02T09:15:00Z'),
    },
    // 14: Open
    {
      refSuffix: '0014',
      itemIndex: 13, // Running Socks (ORD-1005)
      quantity: 1,
      reason: 'Not As Described',
      description: 'Fabric thickness is thinner than high-cushion description.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Support Bot', text: 'Request registered. In unopened condition.' },
      ],
      createdAt: new Date('2026-03-02T16:20:00Z'),
    },
    // 15: In Review
    {
      refSuffix: '0015',
      itemIndex: 14, // Sports Bottle (ORD-1005)
      quantity: 1,
      reason: 'Damaged',
      description: 'Sipper cap thread leaks water when bottle is inverted.',
      status: 'In Review',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Rajesh Kumar', text: 'Requested photo of silicone gasket inside cap.' },
      ],
      createdAt: new Date('2026-03-03T11:00:00Z'),
    },
    // 16: Approved (Refund)
    {
      refSuffix: '0016',
      itemIndex: 15, // Smartwatch (ORD-1006)
      quantity: 1,
      reason: 'Damaged',
      description: 'Display touchscreen has unresponsive dead zone near bottom navigation bar.',
      status: 'Approved',
      resolution: 'Refund',
      refundAmount: 3999.00,
      notes: [
        { agentName: 'Agent Priya Sharma', text: 'Hardware defect verified by video. Prepaid Delhivery pickup scheduled.' },
      ],
      createdAt: new Date('2026-03-03T14:45:00Z'),
    },
    // 17: Open
    {
      refSuffix: '0017',
      itemIndex: 16, // Milanese Strap (ORD-1006)
      quantity: 1,
      reason: 'Wrong Item',
      description: 'Received Silver strap instead of Rose Gold ordered.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Sneha Rao', text: 'Customer attached unboxing photo showing Silver band.' },
      ],
      createdAt: new Date('2026-03-04T08:30:00Z'),
    },
    // 18: In Review
    {
      refSuffix: '0018',
      itemIndex: 17, // Wireless Charging Stand (ORD-1006)
      quantity: 1,
      reason: 'Not As Described',
      description: 'Does not charge phone with shockproof protective bumper case on.',
      status: 'In Review',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Rohan Verma', text: 'Testing Qi charging induction range with thick armor cases.' },
      ],
      createdAt: new Date('2026-03-04T10:15:00Z'),
    },
    // 19: Approved (Replacement)
    {
      refSuffix: '0019',
      itemIndex: 18, // Leather Messenger Bag (ORD-1007)
      quantity: 1,
      reason: 'Damaged',
      description: 'Main brass zipper teeth misaligned and stuck near corner.',
      status: 'Approved',
      resolution: 'Replacement',
      refundAmount: null,
      notes: [
        { agentName: 'Agent Rajesh Kumar', text: 'Approved replacement from fresh craftsman batch.' },
      ],
      createdAt: new Date('2026-03-04T15:00:00Z'),
    },
    // 20: Completed (Store Credit)
    {
      refSuffix: '0020',
      itemIndex: 19, // Leather Wallet (ORD-1007)
      quantity: 1,
      reason: 'Changed Mind',
      description: 'Decided to purchase travel passport holder instead.',
      status: 'Completed',
      resolution: 'Store Credit',
      refundAmount: null,
      notes: [
        { agentName: 'Agent Priya Sharma', text: 'Store credit coupon of ₹1,199 credited to Vikram Malhotra account.' },
      ],
      createdAt: new Date('2026-03-05T09:00:00Z'),
    },
    // 21: In Review
    {
      refSuffix: '0021',
      itemIndex: 20, // Brass Key Valet (ORD-1007)
      quantity: 1,
      reason: 'Damaged',
      description: 'Spring clip retention tension is too loose to secure bike keys.',
      status: 'In Review',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Sneha Rao', text: 'Checking assembly batch quality.' },
      ],
      createdAt: new Date('2026-03-06T11:20:00Z'),
    },
    // 22: Approved (Refund)
    {
      refSuffix: '0022',
      itemIndex: 21, // Electric Kettle (ORD-1008)
      quantity: 1,
      reason: 'Damaged',
      description: 'Auto-shutoff dry boil sensor fails to trigger when water boils.',
      status: 'Approved',
      resolution: 'Refund',
      refundAmount: 2799.00,
      notes: [
        { agentName: 'Agent Priya Sharma', text: 'Safety concern acknowledged immediately. Full ₹2,799 refund approved.' },
      ],
      createdAt: new Date('2026-03-06T16:00:00Z'),
    },
    // 23: Rejected
    {
      refSuffix: '0023',
      itemIndex: 22, // South Indian Filter Brewer (ORD-1008)
      quantity: 1,
      reason: 'Changed Mind',
      description: 'Customer claims decoction takes too long compared to instant coffee powder.',
      status: 'Rejected',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Rajesh Kumar', text: 'Item was used with chicory coffee powder and stained. Ineligible for change of mind return.' },
      ],
      createdAt: new Date('2026-03-07T13:30:00Z'),
    },
    // 24: Open
    {
      refSuffix: '0024',
      itemIndex: 23, // Glass Mug Set (ORD-1008)
      quantity: 1,
      reason: 'Damaged',
      description: 'One borosilicate glass mug cracked at base upon unboxing.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Support Bot', text: 'Transit damage claimed by customer Pooja Nair.' },
      ],
      createdAt: new Date('2026-03-09T10:00:00Z'),
    },
    // 25: Approved (Refund)
    {
      refSuffix: '0025',
      itemIndex: 24, // Polar Parka (ORD-1009)
      quantity: 1,
      reason: 'Size Issue',
      description: 'Size L is too loose around waist and sleeves are 2 inches long.',
      status: 'Approved',
      resolution: 'Refund',
      refundAmount: 2899.00,
      notes: [
        { agentName: 'Agent Rohan Verma', text: 'Return initiated for refund. Customer advised to re-order Size M.' },
      ],
      createdAt: new Date('2026-03-09T14:10:00Z'),
    },
    // 26: Completed (Replacement)
    {
      refSuffix: '0026',
      itemIndex: 25, // Touchscreen Gloves (ORD-1009)
      quantity: 1,
      reason: 'Wrong Item',
      description: 'Received Medium size instead of Large size ordered.',
      status: 'Completed',
      resolution: 'Replacement',
      refundAmount: null,
      notes: [
        { agentName: 'Agent Sneha Rao', text: 'Exchange for Large dispatched via express courier.' },
        { agentName: 'Agent Sneha Rao', text: 'Customer confirmed perfect fit.' },
      ],
      createdAt: new Date('2026-03-10T09:40:00Z'),
    },
    // 27: Open
    {
      refSuffix: '0027',
      itemIndex: 26, // Wool Beanie (ORD-1009)
      quantity: 1,
      reason: 'Changed Mind',
      description: 'Ordered Maroon color, wants Charcoal Grey instead.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Priya Sharma', text: 'Checking Charcoal Grey stock availability.' },
      ],
      createdAt: new Date('2026-03-13T12:00:00Z'),
    },
    // 28: In Review
    {
      refSuffix: '0028',
      itemIndex: 27, // Standing Mat (ORD-1010)
      quantity: 1,
      reason: 'Not As Described',
      description: 'Mat slips slightly on polished Italian marble flooring.',
      status: 'In Review',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Rajesh Kumar', text: 'Advising anti-skid floor grip pad accessory.' },
      ],
      createdAt: new Date('2026-03-13T16:20:00Z'),
    },
    // 29: Approved (Store Credit)
    {
      refSuffix: '0029',
      itemIndex: 28, // Laptop Riser Stand (ORD-1010)
      quantity: 1,
      reason: 'Changed Mind',
      description: 'Already received a laptop riser as a company gift.',
      status: 'Approved',
      resolution: 'Store Credit',
      refundAmount: null,
      notes: [
        { agentName: 'Agent Priya Sharma', text: 'Store credit voucher of ₹1,299 issued.' },
      ],
      createdAt: new Date('2026-03-14T11:15:00Z'),
    },
    // 30: Open
    {
      refSuffix: '0030',
      itemIndex: 29, // Cable Raceway (ORD-1010)
      quantity: 1,
      reason: 'Size Issue',
      description: 'Raceway spine width is narrow for dual thick desktop power cords.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Support Bot', text: 'Return registered.' },
      ],
      createdAt: new Date('2026-03-16T10:00:00Z'),
    },
    // 31: Approved (Refund)
    {
      refSuffix: '0031',
      itemIndex: 0, // Frido Insoles (Historical re-attempt after rejection or extra request on ORD-1001 item 0)
      // Note: itemIndex 0 already has #1 (Open). To preserve Rule 3, let's use another item!
      itemIndex: 8, // Desk Mat ORD-1003 (previous #9 was Completed, so new request is 100% legal per Rule 3!)
      quantity: 1,
      reason: 'Wrong Item',
      description: 'Customer reordered mat but received Navy Blue instead of Dark Charcoal.',
      status: 'Approved',
      resolution: 'Refund',
      refundAmount: 999.00,
      notes: [
        { agentName: 'Agent Priya Sharma', text: 'Approved refund of ₹999 for mispicked color.' },
      ],
      createdAt: new Date('2026-03-16T14:30:00Z'),
    },
    // 32: Rejected
    {
      refSuffix: '0032',
      itemIndex: 5, // Headphone Case ORD-1002 (previous was rejected in #6)
      quantity: 1,
      reason: 'Changed Mind',
      description: 'Customer claims their friend gave them an identical case.',
      status: 'Rejected',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Rajesh Kumar', text: 'Second change of mind attempt on final clearance sale item. Rejected.' },
      ],
      createdAt: new Date('2026-03-17T11:00:00Z'),
    },
    // 33: Open (Item 12 Running shoes ORD-1005 was Completed in #13, so new request is legal!)
    {
      refSuffix: '0033',
      itemIndex: 12, // Running shoes ORD-1005
      quantity: 1,
      reason: 'Wrong Item',
      description: 'Customer reordered but warehouse shipped women edition instead of men UK 9.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Rohan Verma', text: 'Verified label error on shoe carton box.' },
      ],
      createdAt: new Date('2026-03-18T09:00:00Z'),
    },
    // 34: Soft-deleted sample (Status Open, soft-deleted to verify Rule 5)
    {
      refSuffix: '0034',
      itemIndex: 3, // Headphones ORD-1002 (previous was completed in #4)
      quantity: 1,
      reason: 'Changed Mind',
      description: 'Duplicate return ticket generated by mistake when customer pressed submit twice.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      deletedAt: new Date('2026-03-18T10:00:00Z'),
      notes: [
        { agentName: 'Agent Priya Sharma', text: 'Customer confirmed accidental duplicate submission. Soft removed per policy.' },
      ],
      createdAt: new Date('2026-03-18T09:30:00Z'),
    },
  ];

  console.log(`Seeding ${returnRequestsData.length} Indian return requests...`);

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
        deletedAt: r.deletedAt || null,
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

  console.log('--- Indian Dataset Seeding completed successfully! ---');
  console.log('Summary:');
  console.log(`- 10 Indian Orders created with realistic +91 phones & ₹ INR amounts`);
  console.log(`- ${createdItems.length} Order items created`);
  console.log(`- ${returnRequestsData.length} Return requests seeded with Indian names & context.`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
