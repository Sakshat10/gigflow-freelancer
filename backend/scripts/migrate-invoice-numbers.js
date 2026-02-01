/**
 * Migration script to add invoiceNumber to existing invoices
 * Run this once to update all existing invoices with proper invoice numbers
 * 
 * Usage: node scripts/migrate-invoice-numbers.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateInvoiceNumbers() {
    console.log('Starting invoice number migration...');

    try {
        // Get all invoices without invoice numbers
        const invoicesWithoutNumbers = await prisma.invoice.findMany({
            where: {
                invoiceNumber: null
            },
            include: {
                workspace: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        console.log(`Found ${invoicesWithoutNumbers.length} invoices without invoice numbers`);

        if (invoicesWithoutNumbers.length === 0) {
            console.log('No invoices to migrate. All invoices already have invoice numbers.');
            return;
        }

        // Group invoices by user
        const invoicesByUser = {};
        for (const invoice of invoicesWithoutNumbers) {
            const userId = invoice.workspace.userId;
            if (!invoicesByUser[userId]) {
                invoicesByUser[userId] = [];
            }
            invoicesByUser[userId].push(invoice);
        }

        // Process each user's invoices
        for (const [userId, userInvoices] of Object.entries(invoicesByUser)) {
            console.log(`\nProcessing ${userInvoices.length} invoices for user ${userId}`);

            // Get current user counter
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                console.log(`User ${userId} not found, skipping...`);
                continue;
            }

            let currentCounter = user.invoiceCounter;

            // Update each invoice
            for (const invoice of userInvoices) {
                currentCounter++;

                // Generate workspace prefix
                const workspacePrefix = invoice.workspace.name
                    .replace(/[^a-zA-Z0-9]/g, '')
                    .substring(0, 3)
                    .toUpperCase()
                    .padEnd(3, 'X');

                const invoiceNumber = `${workspacePrefix}-${currentCounter.toString().padStart(4, '0')}`;

                // Update invoice
                await prisma.invoice.update({
                    where: { id: invoice.id },
                    data: { invoiceNumber }
                });

                console.log(`  ✓ Updated invoice ${invoice.id.slice(0, 8)} -> ${invoiceNumber}`);
            }

            // Update user counter
            await prisma.user.update({
                where: { id: userId },
                data: { invoiceCounter: currentCounter }
            });

            console.log(`  ✓ Updated user counter to ${currentCounter}`);
        }

        console.log('\n✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
migrateInvoiceNumbers()
    .then(() => {
        console.log('\nDone!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
