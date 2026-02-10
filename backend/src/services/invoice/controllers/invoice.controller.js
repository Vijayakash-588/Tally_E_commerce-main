const service = require('../services/invoice.service');

/**
 * Create new invoice
 */
exports.create = async (req, res, next) => {
  try {
    const invoice = await service.createInvoice(req.body);
    res.status(201).json({
      success: true,
      message: 'Invoice created',
      data: invoice
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all invoices
 */
exports.findAll = async (req, res, next) => {
  try {
    const invoices = await service.findAllInvoices();
    res.json({
      success: true,
      data: invoices,
      count: invoices.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get invoice by ID
 */
exports.findById = async (req, res, next) => {
  try {
    const invoice = await service.findInvoiceById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

/**
 * Get invoice by invoice number
 */
exports.findByNumber = async (req, res, next) => {
  try {
    const invoice = await service.findByInvoiceNumber(req.params.invoiceNumber);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

/**
 * Get invoices by customer
 */
exports.getByCustomer = async (req, res, next) => {
  try {
    const invoices = await service.findByCustomer(req.params.customerId);
    res.json({
      success: true,
      data: invoices,
      count: invoices.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get invoices by status
 */
exports.getByStatus = async (req, res, next) => {
  try {
    const invoices = await service.findByStatus(req.params.status);
    res.json({
      success: true,
      data: invoices,
      count: invoices.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get invoices by date range
 */
exports.getByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const invoices = await service.findByDateRange(
      new Date(startDate),
      new Date(endDate)
    );
    res.json({
      success: true,
      data: invoices,
      count: invoices.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update invoice
 */
exports.update = async (req, res, next) => {
  try {
    const invoice = await service.updateInvoice(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Invoice updated',
      data: invoice
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update invoice status
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const invoice = await service.updateStatus(req.params.id, status);
    res.json({
      success: true,
      message: `Invoice status updated to ${status}`,
      data: invoice
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Send invoice
 */
exports.send = async (req, res, next) => {
  try {
    const invoice = await service.sendInvoice(req.params.id);
    res.json({
      success: true,
      message: 'Invoice sent successfully',
      data: invoice
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Record payment
 */
exports.recordPayment = async (req, res, next) => {
  try {
    const { amount, method, reference, notes, date } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    const invoice = await service.recordPayment(req.params.id, amount, {
      method,
      reference,
      notes,
      date
    });
    res.json({
      success: true,
      message: 'Payment recorded and posted to ledger',
      data: invoice
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete invoice
 */
exports.remove = async (req, res, next) => {
  try {
    await service.deleteInvoice(req.params.id);
    res.json({
      success: true,
      message: 'Invoice deleted'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get invoice summary
 */
exports.getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await service.getInvoiceSummary(
      new Date(startDate),
      new Date(endDate)
    );
    res.json({
      success: true,
      data: summary
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Add line item to invoice
 */
exports.addLineItem = async (req, res, next) => {
  try {
    const lineItem = await service.addLineItem(req.params.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Line item added',
      data: lineItem
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get invoice line items
 */
exports.getLineItems = async (req, res, next) => {
  try {
    const lineItems = await service.getLineItems(req.params.id);
    res.json({
      success: true,
      data: lineItems,
      count: lineItems.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update line item
 */
exports.updateLineItem = async (req, res, next) => {
  try {
    const lineItem = await service.updateLineItem(req.params.lineItemId, req.body);
    res.json({
      success: true,
      message: 'Line item updated',
      data: lineItem
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete line item
 */
exports.deleteLineItem = async (req, res, next) => {
  try {
    await service.deleteLineItem(req.params.lineItemId);
    res.json({
      success: true,
      message: 'Line item deleted'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get overdue invoices
 */
exports.getOverdue = async (req, res, next) => {
  try {
    const invoices = await service.getOverdueInvoices();
    res.json({
      success: true,
      data: invoices,
      count: invoices.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get tax rates
 */
/**
 * Get all payments (for banking ledger)
 */
exports.getPayments = async (req, res, next) => {
  try {
    const payments = await prisma.payments.findMany({
      include: {
        invoice: {
          include: { customers: true }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, data: payments, count: payments.length });
  } catch (err) {
    next(err);
  }
};

exports.getTaxRates = async (req, res, next) => {
  try {
    const rates = await service.getTaxRates();
    res.json({ success: true, data: rates, count: rates.length });
  } catch (err) {
    next(err);
  }
};
