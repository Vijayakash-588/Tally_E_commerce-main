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
  const invoiceNumber = await generateInvoiceNumber();
  
  // Calculate total amount from items if provided
  let totalAmount = data.total_amount;
  if (data.items && data.items.length) {
    const itemsTotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    totalAmount = itemsTotal + (data.tax || 0) - (data.discount || 0);
  }

  return prisma.invoices.create({
    data: {
      customer_id: data.customer_id,
      invoice_number: invoiceNumber,
      issue_date: data.issue_date || new Date(),
      due_date: data.due_date,
      total_amount: totalAmount,
      tax: data.tax || 0,
      discount: data.discount || 0,
      status: 'DRAFT',
      notes: data.notes,
      paid_amount: 0
    },
    include: {
      line_items: true
    }
  });
};

/**
 * Get all invoices
 */
exports.findAllInvoices = async () => {
  return prisma.invoices.findMany({
    include: { line_items: true },
    orderBy: { created_at: 'desc' }
  });
};

/**
 * Get invoice by ID
 */
exports.findInvoiceById = async (id) => {
  return prisma.invoices.findUnique({
    where: { id },
    include: { line_items: true }
  });
};

/**
 * Get invoice by invoice number
 */
exports.findByInvoiceNumber = async (invoiceNumber) => {
  return prisma.invoices.findUnique({
    where: { invoice_number: invoiceNumber },
    include: { line_items: true }
  });
};

/**
 * Get invoices by customer
 */
exports.findByCustomer = async (customerId) => {
  return prisma.invoices.findMany({
    where: { customer_id: customerId },
    include: { line_items: true },
    orderBy: { created_at: 'desc' }
  });
};

/**
 * Get invoices by status
 */
exports.findByStatus = async (status) => {
  return prisma.invoices.findMany({
    where: { status },
    include: { line_items: true },
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
    include: { line_items: true },
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
    include: { line_items: true }
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
    include: { line_items: true }
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
    include: { line_items: true }
  });
};

/**
 * Record payment
 */
exports.recordPayment = async (id, amount) => {
  const invoice = await prisma.invoices.findUnique({ where: { id } });
  const totalPaid = (invoice.paid_amount || 0) + amount;
  const status = totalPaid >= invoice.total_amount ? 'PAID' : 'PARTIAL';

  return prisma.invoices.update({
    where: { id },
    data: {
      paid_amount: totalPaid,
      status,
      updated_at: new Date()
    },
    include: { line_items: true }
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
  return prisma.invoice_items.create({
    data: {
      invoice_id: invoiceId,
      ...lineItemData
    }
  });
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
