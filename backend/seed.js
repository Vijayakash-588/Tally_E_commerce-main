const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Seeding database with default roles...');

    // Create default roles
    const roles = ['user', 'admin', 'manager', 'viewer'];

    for (const roleName of roles) {
      const existingRole = await prisma.roles.findUnique({
        where: { name: roleName }
      });

      if (!existingRole) {
        await prisma.roles.create({
          data: { name: roleName }
        });
        console.log(`✅ Created role: ${roleName}`);
      } else {
        console.log(`⏭️  Role already exists: ${roleName}`);
      }
    }

    console.log('✅ Database seeded successfully!');

    // Seed default tax rates
    const taxRates = [
      { name: 'GST 0%', rate: 0 },
      { name: 'GST 5%', rate: 5 },
      { name: 'GST 12%', rate: 12 },
      { name: 'GST 18%', rate: 18 },
      { name: 'GST 28%', rate: 28 }
    ];

    for (const tr of taxRates) {
      const existing = await prisma.tax_rates.findFirst({ where: { name: tr.name } });
      if (!existing) {
        await prisma.tax_rates.create({ data: { name: tr.name, rate: tr.rate } });
        console.log(`✅ Created tax rate: ${tr.name}`);
      } else {
        console.log(`⏭️  Tax rate exists: ${tr.name}`);
      }
    }

    // Seed sample products
    console.log('\n🌱 Seeding sample products...');
    const products = [
      { name: 'Laptop', sku: 'LP-001', opening_qty: 50, category: 'Electronics', group: 'Computers' },
      { name: 'Mouse', sku: 'MS-001', opening_qty: 200, category: 'Electronics', group: 'Accessories' },
      { name: 'Keyboard', sku: 'KB-001', opening_qty: 150, category: 'Electronics', group: 'Accessories' },
      { name: 'Monitor', sku: 'MN-001', opening_qty: 80, category: 'Electronics', group: 'Displays' },
      { name: 'USB Cable', sku: 'USB-001', opening_qty: 500, category: 'Cables', group: 'Accessories' }
    ];

    for (const prod of products) {
      const existing = await prisma.products.findFirst({ where: { sku: prod.sku } });
      if (!existing) {
        await prisma.products.create({ data: prod });
        console.log(`✅ Created product: ${prod.name}`);
      } else {
        console.log(`⏭️  Product exists: ${prod.name}`);
      }
    }

    // Seed sample customers
    console.log('\n🌱 Seeding sample customers...');
    const customersData = [
      { name: 'ABC Corporation', email: 'abc@example.com', phone: '+91-9876543210', address: 'New Delhi' },
      { name: 'XYZ Industries', email: 'xyz@example.com', phone: '+91-9876543211', address: 'Mumbai' },
      { name: 'Tech Solutions Ltd', email: 'tech@example.com', phone: '+91-9876543212', address: 'Bangalore' }
    ];

    const createdCustomers = [];
    for (const cust of customersData) {
      const existing = await prisma.customers.findFirst({ where: { email: cust.email } });
      if (!existing) {
        const newCust = await prisma.customers.create({ data: cust });
        createdCustomers.push(newCust);
        console.log(`✅ Created customer: ${cust.name}`);
      } else {
        createdCustomers.push(existing);
        console.log(`⏭️  Customer exists: ${cust.name}`);
      }
    }

    // Seed sample sales
    console.log('\n🌱 Seeding sample sales...');
    const prods = await prisma.products.findMany({ select: { id: true, name: true } });
    if (prods.length > 0 && createdCustomers.length > 0) {
      const salesData = [
        { customer_id: createdCustomers[0].id, product_id: prods[0].id, quantity: 5, unit_price: '80000', sale_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
        { customer_id: createdCustomers[1].id, product_id: prods[0].id, quantity: 3, unit_price: '80000', sale_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { customer_id: createdCustomers[2].id, product_id: prods[1].id, quantity: 25, unit_price: '1500', sale_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        { customer_id: createdCustomers[0].id, product_id: prods[2].id, quantity: 20, unit_price: '3000', sale_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { customer_id: createdCustomers[1].id, product_id: prods[3].id, quantity: 4, unit_price: '25000', sale_date: new Date() }
      ];

      for (const sale of salesData) {
        const existing = await prisma.sales.findFirst({ where: { product_id: sale.product_id, customer_id: sale.customer_id, sale_date: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
        if (!existing) {
          await prisma.sales.create({ data: sale });
          console.log(`✅ Created sale: ${sale.quantity} units`);
        }
      }
    }

    // Seed sample stock items (inventory movements)
    console.log('\n🌱 Seeding sample inventory movements...');
    if (prods.length > 0) {
      const movements = [
        { product_id: prods[0].id, type: 'IN', quantity: 10, txn_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), reference: 'PO-001' },
        { product_id: prods[1].id, type: 'OUT', quantity: 30, txn_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), reference: 'SO-001' },
        { product_id: prods[2].id, type: 'IN', quantity: 50, txn_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), reference: 'PO-002' },
        { product_id: prods[3].id, type: 'OUT', quantity: 2, txn_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), reference: 'RET-001' }
      ];

      for (const move of movements) {
        const existing = await prisma.stock_items.findFirst({ where: { product_id: move.product_id, txn_date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, take: 1 });
        if (!existing) {
          await prisma.stock_items.create({ data: move });
          console.log(`✅ Created stock movement: ${move.type} ${move.quantity} units`);
        }
      }
    }

    console.log('\n✅ All sample data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
