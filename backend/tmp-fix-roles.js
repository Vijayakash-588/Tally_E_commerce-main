const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.users.updateMany({
    where: { email: "manager@gmail.com" },
    data: { role_id: "6f93d1ea-2e22-4961-919e-1cb6247e6432" }
  });

  await prisma.users.updateMany({
    where: { email: "admin@gmail.com" },
    data: { role_id: "7b837b5b-5c93-4914-9408-c9bb777dc54e" }
  });

  const rows = await prisma.users.findMany({
    where: { email: { in: ["manager@gmail.com", "admin@gmail.com"] } },
    select: { email: true, roles: { select: { name: true } } }
  });

  console.log(JSON.stringify(rows, null, 2));
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
