const prisma = require('../../../prisma');

/**
 * Generate unique invoice number
 */
const generateInvoiceNumber = async () => {
  const lastInvoice = await prisma.invoices.findFirst({
    orderBy: { created_at: 'desc' }
  });

  const lastNumber = lastInvoice?.invoice_number
    ? parseInt(lastInvoice.invoice_number.split('-')[1])
    : 0;

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');

  return `INV-${lastNumber + 1}-${year}${month}`;
};

/**
 * Create new invoice
 */
exports.createInvoice = async (data) => {
  // Validation
  if (!data.customer_id) {
    throw new Error('Customer is required');
  }
  if (!data.due_date) {
    throw new Error('Due date is required');
  }
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('At least one item is required');
  }

  for (const item of data.items) {
    if (!item.product_id || !item.quantity || item.quantity <= 0) {
      throw new Error('Each item must have a product and valid quantity');
    }
  }

  const invoiceNumber = await generateInvoiceNumber();

  // If items provided, compute amounts and taxes per-line
  let totalAmount = data.total_amount || 0;
  let totalTax = 0;
  const lineItemsCreate = [];

  if (Array.isArray(data.items) && data.items.length) {
    for (const it of data.items) {
      const qty = Number(it.quantity) || 0;
      const unitPrice = Number(it.unit_price ?? it.unitPrice ?? 0) || 0;
      const base = qty * unitPrice;
      let taxAmount = 0;

      // If a raw tax rate percentage is provided use it, otherwise resolve by tax_rate_id
      if (it.tax_rate_percent != null) {
        const pct = Number(it.tax_rate_percent) || 0;
        taxAmount = +(base * (pct / 100));
      } else if (it.tax_rate_id) {
        // attempt to resolve tax rate
        try {
          const tr = await prisma.tax_rates.findUnique({ where: { id: it.tax_rate_id } });
          const pct = tr ? Number(tr.rate) : 0;
          taxAmount = +(base * (pct / 100));
        } catch (e) {
          taxAmount = 0;
        }
      }

      const amount = +(base + taxAmount);
      totalTax += taxAmount;
      lineItemsCreate.push({
        product_id: it.product_id,
        quantity: qty,
        unit_price: unitPrice,
        amount: amount,
        tax_rate_id: it.tax_rate_id || null,
        tax_amount: taxAmount,
        description: it.description || null
      });
    }

    const itemsTotal = lineItemsCreate.reduce((s, li) => s + Number(li.amount || 0), 0);
    totalAmount = itemsTotal - (Number(data.discount) || 0) + (Number(data.round_off) || 0);
    totalTax = totalTax;
  }

  // Use a transaction to ensure invoice and stock movements succeed
  return prisma.$transaction(async (tx) => {
    // Create the invoice
    const invoice = await tx.invoices.create({
      data: {
        customer_id: data.customer_id,
        invoice_number: invoiceNumber,
        issue_date: data.issue_date ? new Date(data.issue_date) : new Date(),
        due_date: data.due_date ? new Date(data.due_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        total_amount: totalAmount,
        tax: totalTax || Number(data.tax) || 0,
        discount: Number(data.discount) || 0,
        round_off: Number(data.round_off) || 0,
        status: data.status || 'DRAFT',
        notes: data.notes,
        paid_amount: 0,
        line_items: {
          create: lineItemsCreate
        }
      },
      include: {
        line_items: true
      }
    });

    // Create stock OUT movements for each item
    if (Array.isArray(data.items) && data.items.length) {
      for (const it of data.items) {
        if (it.product_id && it.quantity) {
          await tx.stock_items.create({
            data: {
              product_id: it.product_id,
              type: 'OUT',
              quantity: Number(it.quantity),
              reference: `Invoice-${invoice.id}`,
              txn_date: data.issue_date ? new Date(data.issue_date) : new Date()
            }
          });
        }
      }
    }

    return invoice;
  });
};

/**
 * Get all invoices
 */
exports.findAllInvoices = async () => {
  return prisma.invoices.findMany({
    include: {
      line_items: true,
      payments: true,
    },
    orderBy: { created_at: 'desc' }
  });
};

/**
 * Get invoice by ID
 */
exports.findInvoiceById = async (id) => {
  return prisma.invoices.findUnique({
    where: { id },
    include: {
      line_items: true,
      payments: true,
    }
  });
};

/**
 * Get invoice by invoice number
 */
exports.findByInvoiceNumber = async (invoiceNumber) => {
  return prisma.invoices.findUnique({
    where: { invoice_number: invoiceNumber },
    include: {
      line_items: true,
      payments: true,
    }
  });
};

/**
 * Get invoices by customer
 */
exports.findByCustomer = async (customerId) => {
  return prisma.invoices.findMany({
    where: { customer_id: customerId },
    include: {
      line_items: true,
      payments: true
    },
    orderBy: { created_at: 'desc' }
  });
};

/**
 * Get invoices by status
 */
exports.findByStatus = async (status) => {
  return prisma.invoices.findMany({
    where: { status },
    include: {
      line_items: true,
      payments: true
    },
    orderBy: { created_at: 'desc' }
  });
};

/**
 * Get invoices by date range
 */
exports.findByDateRange = async (startDate, endDate) => {
  return prisma.invoices.findMany({
    where: {
      created_at: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      line_items: true,
      payments: true
    },
    orderBy: { created_at: 'desc' }
  });
};

/**
 * Update invoice
 */
exports.updateInvoice = async (id, data) => {
  return prisma.invoices.update({
    where: { id },
    data: {
      ...data,
      updated_at: new Date()
    },
    include: {
      line_items: true,
      payments: true
    }
  });
};

/**
 * Update invoice status
 */
exports.updateStatus = async (id, status) => {
  return prisma.invoices.update({
    where: { id },
    data: {
      status,
      updated_at: new Date()
    },
    include: {
      line_items: true,
      payments: true
    }
  });
};

/**
 * Send invoice (update status to sent)
 */
exports.sendInvoice = async (id) => {
  return prisma.invoices.update({
    where: { id },
    data: {
      status: 'SENT',
      updated_at: new Date()
    },
    include: {
      line_items: true,
      payments: true
    }
  });
};

/**
 * Record payment
 */
exports.recordPayment = async (id, amount, paymentDetails = {}) => {
  const invoice = await prisma.invoices.findUnique({ where: { id } });
  const totalPaid = (Number(invoice.paid_amount) || 0) + Number(amount);
  const status = totalPaid >= Number(invoice.total_amount) ? 'PAID' : 'PARTIAL';

  // Use a transaction to ensure both payment record and invoice update succeed
  return prisma.$transaction(async (tx) => {
    // 1. Create the payment record
    await tx.payments.create({
      data: {
        invoice_id: id,
        amount: Number(amount),
        method: paymentDetails.method || 'bank_transfer',
        reference: paymentDetails.reference || null,
        notes: paymentDetails.notes || null,
        date: paymentDetails.date || new Date()
      }
    });

    // 2. Update the invoice
    return tx.invoices.update({
      where: { id },
      data: {
        paid_amount: totalPaid,
        status,
        updated_at: new Date()
      },
      include: {
        line_items: true,
        payments: true
      }
    });
  });
};

/**
 * Delete invoice
 */
exports.deleteInvoice = async (id) => {
  return prisma.invoices.delete({ where: { id } });
};

/**
 * Get invoice summary
 */
exports.getInvoiceSummary = async (startDate, endDate) => {
  // Use default dates if not provided
  const start = startDate && !isNaN(startDate) ? startDate : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate && !isNaN(endDate) ? endDate : new Date();

  const invoices = await prisma.invoices.findMany({
    where: {
      created_at: {
        gte: start,
        lte: end
      }
    }
  });

  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
  const totalPending = totalAmount - totalPaid;
  const avgAmount = totalInvoices > 0 ? totalAmount / totalInvoices : 0;

  const statusBreakdown = {
    DRAFT: invoices.filter(i => i.status === 'DRAFT').length,
    SENT: invoices.filter(i => i.status === 'SENT').length,
    PAID: invoices.filter(i => i.status === 'PAID').length,
    PARTIAL: invoices.filter(i => i.status === 'PARTIAL').length,
    OVERDUE: invoices.filter(i => i.status === 'OVERDUE').length,
    CANCELLED: invoices.filter(i => i.status === 'CANCELLED').length
  };

  return {
    totalInvoices,
    totalAmount,
    totalPaid,
    totalPending,
    avgAmount,
    statusBreakdown
  };
};

/**
 * Add line item to invoice
 */
exports.addLineItem = async (invoiceId, lineItemData) => {
  // Compute tax if tax_rate_percent or tax_rate_id provided
  const qty = Number(lineItemData.quantity) || 0;
  const unitPrice = Number(lineItemData.unit_price ?? lineItemData.unitPrice ?? 0) || 0;
  const base = qty * unitPrice;
  let taxAmount = 0;

  if (lineItemData.tax_rate_percent != null) {
    const pct = Number(lineItemData.tax_rate_percent) || 0;
    taxAmount = +(base * (pct / 100));
  } else if (lineItemData.tax_rate_id) {
    try {
      const tr = await prisma.tax_rates.findUnique({ where: { id: lineItemData.tax_rate_id } });
      const pct = tr ? Number(tr.rate) : 0;
      taxAmount = +(base * (pct / 100));
    } catch (e) {
      taxAmount = 0;
    }
  }

  const amount = +(base + taxAmount);

  const created = await prisma.invoice_items.create({
    data: {
      invoice_id: invoiceId,
      product_id: lineItemData.product_id,
      quantity: qty,
      unit_price: unitPrice,
      amount,
      tax_rate_id: lineItemData.tax_rate_id || null,
      tax_amount: taxAmount || 0,
      description: lineItemData.description || null
    }
  });

  // Recalculate invoice totals
  const items = await prisma.invoice_items.findMany({ where: { invoice_id: invoiceId } });
  const totalAmount = items.reduce((s, it) => s + Number(it.amount || 0), 0);
  const totalTax = items.reduce((s, it) => s + Number(it.tax_amount || 0), 0);
  await prisma.invoices.update({ where: { id: invoiceId }, data: { total_amount: totalAmount, tax: totalTax } });

  return created;
};

/**
 * Get invoice line items
 */
exports.getLineItems = async (invoiceId) => {
  return prisma.invoice_items.findMany({
    where: { invoice_id: invoiceId }
  });
};

/**
 * Update line item
 */
exports.updateLineItem = async (lineItemId, data) => {
  return prisma.invoice_items.update({
    where: { id: lineItemId },
    data
  });
};

/**
 * Delete line item
 */
exports.deleteLineItem = async (lineItemId) => {
  return prisma.invoice_items.delete({
    where: { id: lineItemId }
  });
};

/**
 * Get overdue invoices
 */
exports.getOverdueInvoices = async () => {
  const today = new Date();
  return prisma.invoices.findMany({
    where: {
      status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
      due_date: { lt: today }
    },
    include: { line_items: true },
    orderBy: { due_date: 'asc' }
  });
};

/**
 * Get available tax rates
 */
exports.getTaxRates = async () => {
  return prisma.tax_rates.findMany({ orderBy: { created_at: 'desc' } });
};

/**
 * Get all payments
 */
exports.getPayments = async () => {
  return prisma.payments.findMany({
    include: {
      invoice: true
    },
    orderBy: { date: 'desc' }
  });
};
