const prisma = require('../../prisma');

const isDataQuery = (prompt = '') => {
  const lower = prompt.toLowerCase();
  return ['sales', 'inventory', 'stock', 'invoice', 'payment', 'purchase', 'customer', 'supplier', 'report', 'forecast', 'predict', 'prediction', 'estimate', 'future', 'trend', 'chance'].some((k) => lower.includes(k));
};

const hasAny = (text, keywords) => keywords.some((keyword) => text.includes(keyword));

const buildActionSuggestions = (prompt = '') => {
  const lower = prompt.toLowerCase();
  const suggestions = [];

  if (lower.includes('stock') || lower.includes('inventory')) {
    suggestions.push({ label: 'Review low stock products', route: '/stock-levels' });
  }
  if (lower.includes('sales')) {
    suggestions.push({ label: 'Open sales dashboard', route: '/sales' });
  }
  if (lower.includes('invoice')) {
    suggestions.push({ label: 'Check overdue invoices', route: '/invoices' });
  }
  if (lower.includes('purchase') || lower.includes('supplier')) {
    suggestions.push({ label: 'Open purchases module', route: '/purchases' });
  }
  if (lower.includes('customer')) {
    suggestions.push({ label: 'Open customers module', route: '/customers' });
  }
  if (lower.includes('forecast') || lower.includes('predict') || lower.includes('trend')) {
    suggestions.push({ label: 'Open demand forecasting', route: '/forecasting' });
  }
  if (lower.includes('product')) {
    suggestions.push({ label: 'Review product catalog', route: '/products' });
  }
  if (suggestions.length === 0) {
    suggestions.push({ label: 'Open main dashboard', route: '/' });
  }

  return suggestions;
};

const buildContextSummary = (evidence) => {
  if (!evidence.length) return 'No structured ERP evidence found for this query.';

  return evidence
    .map((item) => `- ${item.title}: ${item.details}`)
    .join('\n');
};

const formatCurrency = (value) => Number(value || 0).toFixed(2);

const getApplicationSnapshot = async () => {
  const [
    productCount,
    customerCount,
    supplierCount,
    salesSummary,
    purchasesSummary,
    invoiceSummary,
    approvalSummary,
    auditSummary,
    recentProducts,
    recentCustomers,
    recentSuppliers,
    recentSales,
    recentPurchases,
    recentInvoices,
    pendingApprovals,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.products.count(),
    prisma.customers.count(),
    prisma.suppliers.count(),
    prisma.sales.aggregate({
      _count: { id: true },
      _sum: { quantity: true, total: true },
      where: { sale_date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
    }),
    prisma.purchases.aggregate({
      _count: { id: true },
      _sum: { quantity: true, total: true },
      where: { purchase_date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
    }),
    prisma.invoices.aggregate({
      _count: { id: true },
      _sum: { total_amount: true, paid_amount: true },
    }),
    prisma.approval_requests.aggregate({
      _count: { id: true },
      where: { status: 'PENDING' }
    }),
    prisma.audit_logs.count(),
    prisma.products.findMany({
      select: { name: true, sku: true, category: true, group: true, opening_qty: true, is_active: true },
      orderBy: { created_at: 'desc' },
      take: 3,
    }),
    prisma.customers.findMany({
      select: { name: true, phone: true, email: true },
      orderBy: { created_at: 'desc' },
      take: 3,
    }),
    prisma.suppliers.findMany({
      select: { name: true, phone: true, email: true },
      orderBy: { created_at: 'desc' },
      take: 3,
    }),
    prisma.sales.findMany({
      select: { quantity: true, unit_price: true, total: true, sale_date: true, products: { select: { name: true, sku: true } }, customers: { select: { name: true } } },
      orderBy: { sale_date: 'desc' },
      take: 3,
    }),
    prisma.purchases.findMany({
      select: { quantity: true, unit_price: true, total: true, purchase_date: true, products: { select: { name: true, sku: true } }, suppliers: { select: { name: true } } },
      orderBy: { purchase_date: 'desc' },
      take: 3,
    }),
    prisma.invoices.findMany({
      select: { invoice_number: true, status: true, total_amount: true, paid_amount: true, due_date: true, customer: { select: { name: true } } },
      orderBy: { issue_date: 'desc' },
      take: 3,
    }),
    prisma.approval_requests.findMany({
      select: { module: true, action: true, status: true, reason: true, created_at: true },
      where: { status: 'PENDING' },
      orderBy: { created_at: 'desc' },
      take: 3,
    }),
    prisma.audit_logs.findMany({
      select: { action: true, resource: true, endpoint: true, status_code: true, created_at: true },
      orderBy: { created_at: 'desc' },
      take: 3,
    }),
  ]);

  return [
    {
      type: 'application_snapshot',
      title: 'Application data overview',
      details: [
        `Products: ${productCount}`,
        `Customers: ${customerCount}`,
        `Suppliers: ${supplierCount}`,
        `Sales (30d): ${salesSummary._count.id || 0}, Qty ${Number(salesSummary._sum.quantity || 0)}, Value ${formatCurrency(salesSummary._sum.total)}`,
        `Purchases (30d): ${purchasesSummary._count.id || 0}, Qty ${Number(purchasesSummary._sum.quantity || 0)}, Value ${formatCurrency(purchasesSummary._sum.total)}`,
        `Invoices: ${invoiceSummary._count.id || 0}, Total ${formatCurrency(invoiceSummary._sum.total_amount)}, Paid ${formatCurrency(invoiceSummary._sum.paid_amount)}`,
        `Pending approvals: ${approvalSummary._count.id || 0}`,
        `Audit log entries: ${auditSummary}`,
      ].join('; ')
    },
    ...recentProducts.map((item) => ({
      type: 'product',
      title: `Product: ${item.name}`,
      details: `SKU ${item.sku}, category ${item.category || 'N/A'}, group ${item.group || 'N/A'}, opening stock ${Number(item.opening_qty || 0)}, active ${item.is_active !== false}`,
    })),
    ...recentCustomers.map((item) => ({
      type: 'customer',
      title: `Customer: ${item.name}`,
      details: `Phone ${item.phone || 'N/A'}, email ${item.email || 'N/A'}`,
    })),
    ...recentSuppliers.map((item) => ({
      type: 'supplier',
      title: `Supplier: ${item.name}`,
      details: `Phone ${item.phone || 'N/A'}, email ${item.email || 'N/A'}`,
    })),
    ...recentSales.map((item) => ({
      type: 'sales',
      title: `Recent sale: ${item.products?.name || 'Unknown product'}`,
      details: `Customer ${item.customers?.name || 'N/A'}, Qty ${Number(item.quantity || 0)}, Total ${formatCurrency(item.total)}, Date ${item.sale_date ? item.sale_date.toISOString().slice(0, 10) : 'N/A'}`,
    })),
    ...recentPurchases.map((item) => ({
      type: 'purchases',
      title: `Recent purchase: ${item.products?.name || 'Unknown product'}`,
      details: `Supplier ${item.suppliers?.name || 'N/A'}, Qty ${Number(item.quantity || 0)}, Total ${formatCurrency(item.total)}, Date ${item.purchase_date ? item.purchase_date.toISOString().slice(0, 10) : 'N/A'}`,
    })),
    ...recentInvoices.map((item) => ({
      type: 'invoice',
      title: `Invoice ${item.invoice_number}`,
      details: `Customer ${item.customer?.name || 'N/A'}, Status ${item.status}, Total ${formatCurrency(item.total_amount)}, Paid ${formatCurrency(item.paid_amount)}, Due ${item.due_date ? item.due_date.toISOString().slice(0, 10) : 'N/A'}`,
    })),
    ...pendingApprovals.map((item) => ({
      type: 'approval',
      title: `Pending approval: ${item.module}`,
      details: `Action ${item.action}, reason ${item.reason || 'N/A'}, created ${item.created_at ? item.created_at.toISOString().slice(0, 10) : 'N/A'}`,
    })),
    ...recentAuditLogs.map((item) => ({
      type: 'audit',
      title: `Audit: ${item.action}`,
      details: `Resource ${item.resource}, endpoint ${item.endpoint}, status ${item.status_code || 'N/A'}, date ${item.created_at ? item.created_at.toISOString().slice(0, 10) : 'N/A'}`,
    })),
  ];
};

const getSalesEvidence = async () => {
  const topSales = await prisma.sales.groupBy({
    by: ['product_id'],
    where: {
      sale_date: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    _sum: {
      quantity: true
    },
    orderBy: {
      _sum: {
        quantity: 'desc'
      }
    },
    take: 3
  });

  if (!topSales.length) {
    return [];
  }

  const productIds = topSales.map((item) => item.product_id);
  const products = await prisma.products.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      sku: true
    }
  });

  const productMap = new Map(products.map((product) => [product.id, product]));

  return topSales.map((item) => {
    const product = productMap.get(item.product_id);

    return {
      type: 'sales',
      title: `Top sold item: ${product?.name || 'Unknown product'}`,
      details: `SKU ${product?.sku || 'N/A'}, Qty sold (30d): ${Number(item._sum.quantity || 0)}`
    };
  });
};

const getPurchaseEvidence = async () => {
  const topPurchases = await prisma.purchases.groupBy({
    by: ['product_id'],
    where: {
      purchase_date: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    _sum: {
      quantity: true
    },
    orderBy: {
      _sum: {
        quantity: 'desc'
      }
    },
    take: 3
  });

  if (!topPurchases.length) {
    return [];
  }

  const productIds = topPurchases.map((item) => item.product_id);
  const products = await prisma.products.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, sku: true }
  });

  const productMap = new Map(products.map((product) => [product.id, product]));

  return topPurchases.map((item) => {
    const product = productMap.get(item.product_id);

    return {
      type: 'purchases',
      title: `Top purchased item: ${product?.name || 'Unknown product'}`,
      details: `SKU ${product?.sku || 'N/A'}, Qty purchased (30d): ${Number(item._sum.quantity || 0)}`
    };
  });
};

const getTopCustomerEvidence = async () => {
  const topCustomers = await prisma.sales.groupBy({
    by: ['customer_id'],
    where: {
      sale_date: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    _sum: {
      total: true
    },
    orderBy: {
      _sum: {
        total: 'desc'
      }
    },
    take: 3
  });

  if (!topCustomers.length) {
    return [];
  }

  const customerIds = topCustomers.map((item) => item.customer_id);
  const customers = await prisma.customers.findMany({
    where: { id: { in: customerIds } },
    select: { id: true, name: true }
  });

  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));

  return topCustomers.map((item) => {
    const customer = customerMap.get(item.customer_id);

    return {
      type: 'customer',
      title: `Top customer: ${customer?.name || 'Unknown customer'}`,
      details: `Sales value (30d): ${formatCurrency(item._sum.total)}`
    };
  });
};

const getTopSupplierEvidence = async () => {
  const topSuppliers = await prisma.purchases.groupBy({
    by: ['supplier_id'],
    where: {
      purchase_date: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    _sum: {
      total: true
    },
    orderBy: {
      _sum: {
        total: 'desc'
      }
    },
    take: 3
  });

  if (!topSuppliers.length) {
    return [];
  }

  const supplierIds = topSuppliers.map((item) => item.supplier_id);
  const suppliers = await prisma.suppliers.findMany({
    where: { id: { in: supplierIds } },
    select: { id: true, name: true }
  });

  const supplierMap = new Map(suppliers.map((supplier) => [supplier.id, supplier]));

  return topSuppliers.map((item) => {
    const supplier = supplierMap.get(item.supplier_id);

    return {
      type: 'supplier',
      title: `Top supplier: ${supplier?.name || 'Unknown supplier'}`,
      details: `Purchase value (30d): ${formatCurrency(item._sum.total)}`
    };
  });
};

const getInvoiceStatusEvidence = async () => {
  const [statusRows, overdueAggregate] = await Promise.all([
    prisma.invoices.groupBy({
      by: ['status'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    }),
    prisma.invoices.aggregate({
      where: {
        due_date: { lt: new Date() },
        status: { notIn: ['PAID', 'CANCELLED'] }
      },
      _count: { id: true },
      _sum: { total_amount: true, paid_amount: true }
    })
  ]);

  const statusEvidence = statusRows.slice(0, 4).map((row) => ({
    type: 'invoice',
    title: `Invoice status: ${row.status}`,
    details: `Count: ${row._count.id || 0}`
  }));

  const overdueOutstanding = Number(overdueAggregate._sum.total_amount || 0) - Number(overdueAggregate._sum.paid_amount || 0);

  statusEvidence.push({
    type: 'invoice',
    title: 'Overdue invoice summary',
    details: `Overdue count: ${overdueAggregate._count.id || 0}, outstanding amount: ${formatCurrency(overdueOutstanding)}`
  });

  return statusEvidence;
};

const getLowStockEvidence = async () => {
  const products = await prisma.products.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      opening_qty: true
    }
  });

  const movements = await prisma.stock_items.findMany({
    where: {
      txn_date: {
        gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      }
    },
    select: {
      product_id: true,
      type: true,
      quantity: true
    }
  });

  const movementMap = movements.reduce((acc, row) => {
    if (!acc[row.product_id]) {
      acc[row.product_id] = { inwards: 0, outwards: 0 };
    }
    if (row.type === 'IN') acc[row.product_id].inwards += Number(row.quantity || 0);
    if (row.type === 'OUT') acc[row.product_id].outwards += Number(row.quantity || 0);
    return acc;
  }, {});

  const lowStock = products
    .map((product) => {
      const m = movementMap[product.id] || { inwards: 0, outwards: 0 };
      const closing = Number(product.opening_qty || 0) + m.inwards - m.outwards;
      return {
        name: product.name,
        sku: product.sku,
        closing
      };
    })
    .filter((row) => row.closing <= 10)
    .sort((a, b) => a.closing - b.closing)
    .slice(0, 3);

  return lowStock.map((item) => ({
    type: 'inventory',
    title: `Low stock: ${item.name}`,
    details: `SKU ${item.sku}, current stock ${item.closing}`
  }));
};

const getOverdueInvoiceEvidence = async () => {
  const overdue = await prisma.invoices.findMany({
    where: {
      due_date: { lt: new Date() },
      status: { notIn: ['PAID', 'CANCELLED'] }
    },
    select: {
      invoice_number: true,
      due_date: true,
      total_amount: true,
      paid_amount: true
    },
    orderBy: { due_date: 'asc' },
    take: 3
  });

  return overdue.map((item) => ({
    type: 'invoice',
    title: `Overdue invoice ${item.invoice_number}`,
    details: `Due ${item.due_date.toISOString().slice(0, 10)}, outstanding ${Number(item.total_amount) - Number(item.paid_amount)}`
  }));
};

exports.buildEvidence = async (prompt) => {
  const lower = (prompt || '').toLowerCase();

  const tasks = [];
  const dataQuery = isDataQuery(lower);

  const needsSalesEvidence = hasAny(lower, ['sales', 'revenue', 'top']);
  const needsInventoryEvidence = hasAny(lower, ['stock', 'inventory']);
  const needsInvoiceEvidence = hasAny(lower, ['invoice', 'overdue', 'payment']);
  const needsPurchaseEvidence = hasAny(lower, ['purchase', 'procurement']);
  const needsCustomerEvidence = hasAny(lower, ['customer', 'client']);
  const needsSupplierEvidence = hasAny(lower, ['supplier', 'vendor']);
  const needsForecastEvidence = hasAny(lower, ['forecast', 'predict', 'prediction', 'trend', 'estimate']);

  if (dataQuery) {
    tasks.push(getApplicationSnapshot());
  }

  if (needsSalesEvidence || needsForecastEvidence) tasks.push(getSalesEvidence());
  if (needsInventoryEvidence || needsForecastEvidence) tasks.push(getLowStockEvidence());
  if (needsInvoiceEvidence) tasks.push(getOverdueInvoiceEvidence(), getInvoiceStatusEvidence());
  if (needsPurchaseEvidence || needsForecastEvidence) tasks.push(getPurchaseEvidence());
  if (needsCustomerEvidence) tasks.push(getTopCustomerEvidence());
  if (needsSupplierEvidence) tasks.push(getTopSupplierEvidence());

  if (dataQuery && tasks.length === 1) {
    tasks.push(getSalesEvidence(), getPurchaseEvidence(), getInvoiceStatusEvidence());
  }

  const results = tasks.length ? await Promise.all(tasks) : [];
  const evidence = results.flat();

  return {
    evidence,
    contextSummary: buildContextSummary(evidence),
    actionSuggestions: buildActionSuggestions(prompt),
    dataQuery
  };
};
