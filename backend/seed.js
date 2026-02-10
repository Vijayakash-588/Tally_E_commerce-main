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
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
