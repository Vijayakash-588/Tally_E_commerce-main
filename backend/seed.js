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
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
