const prisma = require('../../../prisma');

async function seedTaxRates() {
    console.log('Seeding Tax Rates...');

    const rates = [
        { name: 'GST 5%', rate: 5.00 },
        { name: 'GST 12%', rate: 12.00 },
        { name: 'GST 18%', rate: 18.00 },
        { name: 'GST 28%', rate: 28.00 },
        { name: 'Exempt', rate: 0.00 }
    ];

    for (const rate of rates) {
        const existing = await prisma.tax_rates.findFirst({
            where: { name: rate.name }
        });

        if (!existing) {
            await prisma.tax_rates.create({
                data: rate
            });
            console.log(`Created tax rate: ${rate.name}`);
        } else {
            console.log(`Tax rate exists: ${rate.name}`);
        }
    }

    console.log('Tax Rates Seeding Completed.');
}

seedTaxRates()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
