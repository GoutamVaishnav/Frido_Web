const { PrismaClient } = require('@prisma/client');
const { mockOrders } = require('./seedData');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting ReturnDesk Database Seeding ---');

  // Clear existing records if needed (in cascade order)
  console.log('Cleaning existing database records...');
  await prisma.returnNote.deleteMany({});
  await prisma.returnRequest.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});

  console.log('Seeding 10 mock orders and products...');
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

  // Define 32 realistic return requests ensuring Rule 3 (No duplicate live requests on same order item)
  // Statuses: Open, In Review, Approved, Rejected, Completed
  // Reasons: Damaged, Wrong Item, Size Issue, Not As Described, Changed Mind
  // Resolutions: Refund, Replacement, Store Credit

  const returnRequestsData = [
    // 1: Open
    {
      refSuffix: '0001',
      itemIndex: 0, // Headphones (ORD-1001)
      quantity: 1,
      reason: 'Damaged',
      description: 'The right ear cup produces severe static buzzing noise when active noise cancelling is toggled.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Alex Rivera (Customer Portal)', text: 'Return initiated through online customer support portal.' },
      ],
      createdAt: new Date('2026-02-16T11:00:00Z'),
    },
    // 2: In Review
    {
      refSuffix: '0002',
      itemIndex: 1, // USB-C Cables (ORD-1001)
      quantity: 1,
      reason: 'Wrong Item',
      description: 'Received USB-A to USB-C cables instead of the dual USB-C 100W cables ordered.',
      status: 'In Review',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Sarah Davis', text: 'Requested photos of the packaging barcode to verify warehouse mispick.' },
        { agentName: 'Agent Sarah Davis', text: 'Photos received from customer. Packaging verified as SKU ACC-CAB-001 instead of 002.' },
      ],
      createdAt: new Date('2026-02-17T09:30:00Z'),
    },
    // 3: Approved (Refund)
    {
      refSuffix: '0003',
      itemIndex: 2, // Headphone Travel Case (ORD-1001)
      quantity: 1,
      reason: 'Not As Described',
      description: 'The case interior zipper was defective and does not fit the AcousticPro model despite description.',
      status: 'Approved',
      resolution: 'Refund',
      refundAmount: 49.99,
      notes: [
        { agentName: 'Agent Mike Zhao', text: 'Approved full refund. Prepaid return shipping label generated and sent.' },
      ],
      createdAt: new Date('2026-02-18T14:20:00Z'),
    },
    // 4: Completed (Replacement)
    {
      refSuffix: '0004',
      itemIndex: 3, // Ergo Mesh Chair (ORD-1002) - Historical completed
      quantity: 1,
      reason: 'Damaged',
      description: 'Armrest bracket arrived cracked in transit.',
      status: 'Completed',
      resolution: 'Replacement',
      refundAmount: null,
      notes: [
        { agentName: 'Agent Emily Thorne', text: 'Dispatched replacement armrest assembly with express tracking #1Z9999.' },
        { agentName: 'Agent Emily Thorne', text: 'Delivery confirmed by customer. Ticket closed successfully.' },
      ],
      createdAt: new Date('2026-02-20T10:15:00Z'),
    },
    // 5: Open (Desk Mat ORD-1002)
    {
      refSuffix: '0005',
      itemIndex: 4, // Anti-Fatigue Desk Mat
      quantity: 1,
      reason: 'Changed Mind',
      description: 'Desk mat is too large for current workstation setup.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Support Bot', text: 'Initial return request received. Item reported in unopened condition.' },
      ],
      createdAt: new Date('2026-02-22T16:00:00Z'),
    },
    // 6: Rejected (Cable Raceway ORD-1002)
    {
      refSuffix: '0006',
      itemIndex: 5, // Cable Management Spine
      quantity: 1,
      reason: 'Size Issue',
      description: 'Does not reach floor from high standing desk setting.',
      status: 'Rejected',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Mike Zhao', text: 'Product dimensions clearly state 48 inches max height. Customer customized desk to 56 inches.' },
        { agentName: 'Agent Mike Zhao', text: 'Return rejected under modification guidelines. Recommended extension module.' },
      ],
      createdAt: new Date('2026-02-23T11:45:00Z'),
    },
    // 7: Open (Running Shoes ORD-1003)
    {
      refSuffix: '0007',
      itemIndex: 6, // Running shoes
      quantity: 1,
      reason: 'Size Issue',
      description: 'Toe box is slightly too narrow. Need half a size larger.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Sarah Davis', text: 'Customer asked if exchange for size 10.5 is in stock.' },
      ],
      createdAt: new Date('2026-02-24T13:10:00Z'),
    },
    // 8: Approved (Store Credit)
    {
      refSuffix: '0008',
      itemIndex: 7, // Compression socks (ORD-1003)
      quantity: 2,
      reason: 'Changed Mind',
      description: 'Decided to switch to merino trail socks instead.',
      status: 'Approved',
      resolution: 'Store Credit',
      refundAmount: null,
      notes: [
        { agentName: 'Agent Emily Thorne', text: 'Store credit coupon of $50.00 issued to customer account.' },
      ],
      createdAt: new Date('2026-02-25T15:20:00Z'),
    },
    // 9: Completed (Refund)
    {
      refSuffix: '0009',
      itemIndex: 8, // Hydration Vest (ORD-1003)
      quantity: 1,
      reason: 'Not As Described',
      description: 'Flasks leak around screw cap seals on first fill.',
      status: 'Completed',
      resolution: 'Refund',
      refundAmount: 120.00,
      notes: [
        { agentName: 'Agent Sarah Davis', text: 'Defective batch confirmed with vendor. Full refund posted to original Visa card.' },
      ],
      createdAt: new Date('2026-02-26T17:00:00Z'),
    },
    // 10: In Review (Keyboard ORD-1004)
    {
      refSuffix: '0010',
      itemIndex: 9, // Mech Keyboard
      quantity: 1,
      reason: 'Damaged',
      description: 'Spacebar stabilizer wire is popped out and key sticks repeatedly.',
      status: 'In Review',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent David Vance', text: 'Sent keyboard troubleshooting guide. Awaiting customer test response.' },
      ],
      createdAt: new Date('2026-02-27T10:00:00Z'),
    },
    // 11: Approved (Replacement)
    {
      refSuffix: '0011',
      itemIndex: 10, // Vertical Mouse (ORD-1004)
      quantity: 1,
      reason: 'Damaged',
      description: 'Optical sensor stutters intermittently on smooth wood surface.',
      status: 'Approved',
      resolution: 'Replacement',
      refundAmount: null,
      notes: [
        { agentName: 'Agent David Vance', text: 'Replacement mouse order created with priority courier.' },
      ],
      createdAt: new Date('2026-02-28T14:30:00Z'),
    },
    // 12: Rejected (Desk Mat ORD-1004)
    {
      refSuffix: '0012',
      itemIndex: 11, // Wool Felt Mat
      quantity: 1,
      reason: 'Changed Mind',
      description: 'Customer claims they found a cheaper alternative elsewhere after 3 weeks of daily use.',
      status: 'Rejected',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Sarah Davis', text: 'Return request rejected. Item shows clear pet hair and usage signs outside 14-day remorse window.' },
      ],
      createdAt: new Date('2026-03-01T12:00:00Z'),
    },
    // 13: Completed (Refund)
    {
      refSuffix: '0013',
      itemIndex: 12, // Commuter Backpack (ORD-1005)
      quantity: 1,
      reason: 'Wrong Item',
      description: 'Ordered Espresso Brown leather, received Pitch Black.',
      status: 'Completed',
      resolution: 'Refund',
      refundAmount: 350.00,
      notes: [
        { agentName: 'Agent Emily Thorne', text: 'Customer opted for refund as Espresso Brown is out of stock.' },
        { agentName: 'Agent Emily Thorne', text: 'Return received in warehouse. $350.00 refund processed.' },
      ],
      createdAt: new Date('2026-03-02T09:15:00Z'),
    },
    // 14: Open (Leather Wallet ORD-1005)
    {
      refSuffix: '0014',
      itemIndex: 13, // Leather Wallet
      quantity: 1,
      reason: 'Size Issue',
      description: 'Too thick when 6 credit cards are inserted.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Support Bot', text: 'Request logged. Customer awaiting guidance on slimmer cardholder alternatives.' },
      ],
      createdAt: new Date('2026-03-02T16:20:00Z'),
    },
    // 15: In Review (Brass Key Organizer ORD-1005)
    {
      refSuffix: '0015',
      itemIndex: 14, // Key Organizer
      quantity: 1,
      reason: 'Damaged',
      description: 'Tension screw threads are stripped out of the box.',
      status: 'In Review',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Mike Zhao', text: 'Requested photo of stripped thread to check manufacturing batch.' },
      ],
      createdAt: new Date('2026-03-03T11:00:00Z'),
    },
    // 16: Approved (Refund)
    {
      refSuffix: '0016',
      itemIndex: 15, // Laptop Sleeve ORD-1005
      quantity: 1,
      reason: 'Size Issue',
      description: '15-inch sleeve is too snug for 15.6 gaming laptop chassis.',
      status: 'Approved',
      resolution: 'Refund',
      refundAmount: 150.00,
      notes: [
        { agentName: 'Agent Sarah Davis', text: 'Approved return for refund upon warehouse receipt.' },
      ],
      createdAt: new Date('2026-03-03T14:45:00Z'),
    },
    // 17: Open (Smart Kettle ORD-1006)
    {
      refSuffix: '0017',
      itemIndex: 16, // Smart Kettle
      quantity: 1,
      reason: 'Damaged',
      description: 'Base heating element trips the GFCI breaker repeatedly.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent David Vance', text: 'High priority electrical defect flagged.' },
      ],
      createdAt: new Date('2026-03-04T08:30:00Z'),
    },
    // 18: In Review (Coffee Grinder ORD-1006)
    {
      refSuffix: '0018',
      itemIndex: 17, // Coffee Grinder
      quantity: 1,
      reason: 'Not As Described',
      description: 'Espresso grind setting is too coarse for unpressurized portafilter baskets.',
      status: 'In Review',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Emily Thorne', text: 'Consulting with equipment specialist on burr calibration shim kit.' },
      ],
      createdAt: new Date('2026-03-04T10:15:00Z'),
    },
    // 19: Approved (Replacement)
    {
      refSuffix: '0019',
      itemIndex: 18, // Glass Cups ORD-1006
      quantity: 1,
      reason: 'Damaged',
      description: 'One of the four double-walled glasses arrived shattered in package.',
      status: 'Approved',
      resolution: 'Replacement',
      refundAmount: null,
      notes: [
        { agentName: 'Agent Mike Zhao', text: 'Customer provided photos of broken glass. Sent replacement 4-pack immediately.' },
      ],
      createdAt: new Date('2026-03-04T15:00:00Z'),
    },
    // 20: Completed (Store Credit)
    {
      refSuffix: '0020',
      itemIndex: 19, // Pour-Over Filter ORD-1006
      quantity: 1,
      reason: 'Changed Mind',
      description: 'Prefers paper filters over stainless mesh taste profile.',
      status: 'Completed',
      resolution: 'Store Credit',
      refundAmount: null,
      notes: [
        { agentName: 'Agent Sarah Davis', text: '$45.00 store credit gift code sent to customer email.' },
      ],
      createdAt: new Date('2026-03-05T09:00:00Z'),
    },
    // 21: In Review (4K Monitor ORD-1007)
    {
      refSuffix: '0021',
      itemIndex: 20, // 4K Monitor
      quantity: 1,
      reason: 'Damaged',
      description: 'Cluster of 4 bright dead pixels near the top-center edge.',
      status: 'In Review',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent David Vance', text: 'Checking manufacturer pixel defect threshold policy (ISO 13406-2).' },
      ],
      createdAt: new Date('2026-03-06T11:20:00Z'),
    },
    // 22: Approved (Refund)
    {
      refSuffix: '0022',
      itemIndex: 21, // Monitor Arm ORD-1007
      quantity: 1,
      reason: 'Size Issue',
      description: 'Desk clamp does not fit bevel on chamfered desk edge.',
      status: 'Approved',
      resolution: 'Refund',
      refundAmount: 120.00,
      notes: [
        { agentName: 'Agent David Vance', text: 'Customer initiated return. Return label dispatched.' },
      ],
      createdAt: new Date('2026-03-06T16:00:00Z'),
    },
    // 23: Rejected (HDMI Cable ORD-1007)
    {
      refSuffix: '0023',
      itemIndex: 22, // HDMI Cable
      quantity: 1,
      reason: 'Changed Mind',
      description: 'Customer claims they no longer need the extra cable.',
      status: 'Rejected',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Sarah Davis', text: 'Item cable seal was cut open and cable stripped. Ineligible for change-of-mind return.' },
      ],
      createdAt: new Date('2026-03-07T13:30:00Z'),
    },
    // 24: Open (Expedition Parka ORD-1008)
    {
      refSuffix: '0024',
      itemIndex: 23, // Expedition Parka
      quantity: 1,
      reason: 'Size Issue',
      description: 'Medium is too loose around shoulders. Customer wants Small if available.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Support Bot', text: 'Size exchange inquiry queued.' },
      ],
      createdAt: new Date('2026-03-09T10:00:00Z'),
    },
    // 25: Approved (Refund)
    {
      refSuffix: '0025',
      itemIndex: 24, // Thermal Gloves ORD-1008
      quantity: 1,
      reason: 'Wrong Item',
      description: 'Received leather work gloves instead of Thermal Touchscreen gloves.',
      status: 'Approved',
      resolution: 'Refund',
      refundAmount: 45.00,
      notes: [
        { agentName: 'Agent Emily Thorne', text: 'Warehouse SKU mapping error confirmed. Refund approved.' },
      ],
      createdAt: new Date('2026-03-09T14:10:00Z'),
    },
    // 26: Completed (Replacement)
    {
      refSuffix: '0026',
      itemIndex: 25, // Merino Beanie ORD-1008
      quantity: 1,
      reason: 'Damaged',
      description: 'Unraveled knit seam on top crown.',
      status: 'Completed',
      resolution: 'Replacement',
      refundAmount: null,
      notes: [
        { agentName: 'Agent Mike Zhao', text: 'Replacement beanie shipped.' },
        { agentName: 'Agent Mike Zhao', text: 'Customer reported receipt of flawless replacement. Closed.' },
      ],
      createdAt: new Date('2026-03-10T09:40:00Z'),
    },
    // 27: Open (Smartwatch ORD-1009)
    {
      refSuffix: '0027',
      itemIndex: 26, // Fitness Watch
      quantity: 1,
      reason: 'Not As Described',
      description: 'Heart rate monitor readings spike inaccurately compared to chest strap.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent David Vance', text: 'Advised customer on optical sensor skin contact adjustment.' },
      ],
      createdAt: new Date('2026-03-13T12:00:00Z'),
    },
    // 28: In Review (Sports Band ORD-1009)
    {
      refSuffix: '0028',
      itemIndex: 27, // Sports Band
      quantity: 1,
      reason: 'Wrong Item',
      description: 'Received 20mm lug width instead of 22mm.',
      status: 'In Review',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Sarah Davis', text: 'Checking warehouse inventory for correct 22mm bands.' },
      ],
      createdAt: new Date('2026-03-13T16:20:00Z'),
    },
    // 29: Approved (Store Credit)
    {
      refSuffix: '0029',
      itemIndex: 28, // Fast Charging Puck ORD-1009
      quantity: 1,
      reason: 'Changed Mind',
      description: 'Already had a wireless pad that works with the watch.',
      status: 'Approved',
      resolution: 'Store Credit',
      refundAmount: null,
      notes: [
        { agentName: 'Agent Emily Thorne', text: 'Approved for $40.00 store credit.' },
      ],
      createdAt: new Date('2026-03-14T11:15:00Z'),
    },
    // 30: Open (Ceramic Lamp ORD-1010)
    {
      refSuffix: '0030',
      itemIndex: 29, // Table Lamp
      quantity: 1,
      reason: 'Damaged',
      description: 'Ceramic lamp base cracked during shipping transit.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Support Bot', text: 'Customer uploaded delivery photo showing box crushed on corner.' },
      ],
      createdAt: new Date('2026-03-16T10:00:00Z'),
    },
    // 31: Approved (Refund)
    {
      refSuffix: '0031',
      itemIndex: 30, // Smart Bulbs ORD-1010
      quantity: 1,
      reason: 'Not As Described',
      description: 'Bulbs flicker when paired with standard dimmer switch.',
      status: 'Approved',
      resolution: 'Refund',
      refundAmount: 35.00,
      notes: [
        { agentName: 'Agent Mike Zhao', text: 'Bulbs require dedicated smart app dimming, incompatible with mechanical dimmers. Refund approved.' },
      ],
      createdAt: new Date('2026-03-16T14:30:00Z'),
    },
    // 32: Rejected (Jute Coaster ORD-1010)
    {
      refSuffix: '0032',
      itemIndex: 31, // Coasters
      quantity: 1,
      reason: 'Changed Mind',
      description: 'Color doesn’t match dining table.',
      status: 'Rejected',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Sarah Davis', text: 'Clear clearance final-sale tag on coaster set. Returns not permitted for this item.' },
      ],
      createdAt: new Date('2026-03-17T11:00:00Z'),
    },
    // 33: A second historical request on an item that was previously Rejected (ORD-1002 Item 5) - perfectly allowed by Rule 3!
    {
      refSuffix: '0033',
      itemIndex: 5, // Cable Management Spine (ORD-1002), previously rejected in #6
      quantity: 1,
      reason: 'Wrong Item',
      description: 'Customer found warehouse shipped the standard model instead of the extended model specified in confirmation email.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      notes: [
        { agentName: 'Agent Sarah Davis', text: 'Re-opened under misdelivery case after reviewing original purchase confirmation.' },
      ],
      createdAt: new Date('2026-03-18T09:00:00Z'),
    },
    // 34: A soft-deleted request (Status Open, soft-deleted to test Rule 5)
    {
      refSuffix: '0034',
      itemIndex: 4, // Anti-Fatigue Desk Mat
      quantity: 1,
      reason: 'Changed Mind',
      description: 'Accidental return request duplicate submitted by customer.',
      status: 'Open',
      resolution: null,
      refundAmount: null,
      deletedAt: new Date('2026-03-18T10:00:00Z'),
      notes: [
        { agentName: 'Agent Mike Zhao', text: 'Customer called stating this was submitted by error. Removed via soft deletion.' },
      ],
      createdAt: new Date('2026-03-18T09:30:00Z'),
    },
  ];

  console.log(`Seeding ${returnRequestsData.length} return requests...`);

  for (const r of returnRequestsData) {
    const item = createdItems[r.itemIndex];
    const order = createdOrders.find((o) => o.id === item.orderId);

    const ref = `RET-2026-${r.refSuffix}`;

    const createdReq = await prisma.returnRequest.create({
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

  console.log('--- Seeding completed successfully! ---');
  console.log(`Summary:`);
  console.log(`- 10 Orders created`);
  console.log(`- ${createdItems.length} Order items created`);
  console.log(`- ${returnRequestsData.length} Return requests seeded across all statuses and reasons.`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
