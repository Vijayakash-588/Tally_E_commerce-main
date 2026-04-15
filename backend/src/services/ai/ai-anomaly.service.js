const prisma = require('../../prisma');
const { detectAnomalies } = require('./ai-openai.service');

/**
 * Detect anomalies in sales transactions
 */
exports.detectSalesAnomalies = async ({ lookbackDays = 30 } = {}) => {
  try {
    const lookbackStart = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

    // Get recent sales
    const sales = await prisma.sales.findMany({
      where: { sale_date: { gte: lookbackStart } },
      include: {
        customers: { select: { name: true, email: true } },
        products: { select: { name: true, sku: true } }
      },
      orderBy: { sale_date: 'desc' },
      take: 50
    });

    if (sales.length === 0) {
      return { success: true, anomalies: [], message: 'No recent sales to analyze' };
    }

    // Prepare data for analysis
    const analysisData = sales.map(s => ({
      id: s.id,
      quantity: s.quantity,
      unit_price: Number(s.unit_price),
      total: Number(s.unit_price) * s.quantity,
      discount: Number(s.discount),
      tax: Number(s.tax),
      customer: s.customers?.name,
      product: s.products?.name,
      date: s.sale_date
    }));

    // Analyze with AI
    const analysis = await detectAnomalies(
      analysisData,
      'E-commerce sales transactions. Flag unusual: very high/low quantities, price discrepancies, repeated customers with suspicious patterns, unusually large discounts or tax amounts.'
    );

    return {
      success: analysis.success,
      anomalies_found: analysis.anomalies || [],
      suspicious_transactions: analysis.suspicious_transactions || [],
      summary: analysis.summary || 'Analysis complete',
      analyzed_records: analysisData.length
    };
  } catch (error) {
    console.error('Sales Anomaly Detection Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Detect inventory anomalies
 */
exports.detectInventoryAnomalies = async ({ lookbackDays = 30 } = {}) => {
  try {
    const lookbackStart = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

    // Get recent movements
    const movements = await prisma.stock_items.findMany({
      where: { txn_date: { gte: lookbackStart } },
      include: { products: { select: { name: true, sku: true, opening_qty: true } } },
      orderBy: { txn_date: 'desc' },
      take: 100
    });

    if (movements.length === 0) {
      return { success: true, anomalies: [], message: 'No recent movements to analyze' };
    }

    const analysisData = movements.map(m => ({
      product: m.products?.name,
      sku: m.products?.sku,
      type: m.type,
      quantity: m.quantity,
      reference: m.reference,
      date: m.txn_date,
      opening_qty: m.products?.opening_qty
    }));

    // Analyze with AI
    const analysis = await detectAnomalies(
      analysisData,
      'Inventory movements. Flag unusual: disproportionately large movements, quantity mismatches, unusual transaction types, missing references.'
    );

    return {
      success: analysis.success,
      anomalies_found: analysis.anomalies || [],
      warnings: analysis.warnings || [],
      summary: analysis.summary || 'Analysis complete',
      analyzed_records: analysisData.length
    };
  } catch (error) {
    console.error('Inventory Anomaly Detection Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Comprehensive business anomalies (invoices, payments)
 */
exports.detectBusinessAnomalies = async ({ lookbackDays = 30 } = {}) => {
  try {
    const lookbackStart = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

    // Get invoices with payment status
    const invoices = await prisma.invoices.findMany({
      where: { issue_date: { gte: lookbackStart } },
      include: { customer: { select: { name: true, email: true } } },
      take: 30
    });

    const analysisData = invoices.map(inv => ({
      invoice_number: inv.invoice_number,
      customer: inv.customer?.name,
      total_amount: Number(inv.total_amount),
      paid_amount: Number(inv.paid_amount),
      outstanding: Number(inv.total_amount) - Number(inv.paid_amount),
      status: inv.status,
      days_overdue: Math.floor((Date.now() - inv.due_date.getTime()) / (1000 * 60 * 60 * 24)),
      created_date: inv.issue_date
    }));

    // Analyze with AI
    const analysis = await detectAnomalies(
      analysisData,
      'Business invoices. Flag: severely overdue payments, extreme amounts, patterns of partial payments or non-payment from specific customers.'
    );

    return {
      success: analysis.success,
      anomalies_found: analysis.anomalies || [],
      payment_risks: analysis.payment_risks || [],
      recommendations: analysis.recommendations || [],
      analyzed_records: analysisData.length
    };
  } catch (error) {
    console.error('Business Anomaly Detection Error:', error);
    return { success: false, error: error.message };
  }
};
