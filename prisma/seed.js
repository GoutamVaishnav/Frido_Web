const { PrismaClient } = require('@prisma/client');
const { mockOrders } = require('./seedData');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Clean State: 10 Mock Orders Only ---');

  // Clear existing records in cascade order
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

  console.log(`\n✔ Successfully created ${createdOrders.length} mock orders with ${createdItems.length} purchased items.`);
  console.log('✔ Return requests table is now clean (0 returns).');
  console.log('👉 You can now go to Orders, create a return request, and test the full approval lifecycle step-by-step yourself!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
