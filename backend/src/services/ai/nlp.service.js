const ERP_TERMS = [
  'sales', 'inventory', 'stock', 'invoice', 'payment', 'purchase', 'purchases',
  'customer', 'customers', 'supplier', 'suppliers', 'report', 'reports', 'summary',
  'dashboard', 'forecast', 'predict', 'prediction', 'estimate', 'future', 'trend',
  'analytics', 'kpi', 'order', 'orders', 'product', 'products', 'profit', 'loss',
  'p&l', 'ledger', 'reconciliation', 'bank', 'cash', 'tax', 'gst', 'expense', 'income'
];

const KNOWLEDGE_TERMS = [
  'what is', 'why', 'how', 'explain', 'difference', 'best practice', 'example',
  'code', 'javascript', 'node', 'react', 'sql', 'api', 'ai', 'nlp', 'machine learning'
];

const MODULE_TERMS = [
  'sales', 'purchases', 'inventory', 'invoices', 'customers', 'suppliers',
  'forecasting', 'dashboard', 'banking', 'products', 'approvals', 'blockchain'
];

const METRIC_TERMS = [
  'revenue', 'profit', 'loss', 'margin', 'growth', 'outstanding', 'overdue',
  'stock level', 'turnover', 'cash flow', 'units sold', 'average order value'
];

const hasAny = (text, terms) => terms.some((term) => text.includes(term));

const isAsciiLike = (text) => {
  for (const char of text) {
    const code = char.charCodeAt(0);
    const isPrintableAscii = code >= 32 && code <= 126;
    const isAllowedWhitespace = code === 9 || code === 10 || code === 13;
    if (!isPrintableAscii && !isAllowedWhitespace) {
      return false;
    }
  }
  return true;
};

const detectLanguage = (text) => {
  if (isAsciiLike(text)) {
    return 'english_or_ascii';
  }

  if (/[\u0900-\u097F]/.test(text)) return 'indic';
  if (/[\u0600-\u06FF]/.test(text)) return 'arabic';
  if (/[\u4E00-\u9FFF]/.test(text)) return 'cjk';

  return 'mixed';
};

const extractTimeRange = (text) => {
  if (text.includes('today')) return 'today';
  if (text.includes('yesterday')) return 'yesterday';
  if (text.includes('this week')) return 'this_week';
  if (text.includes('this month')) return 'this_month';
  if (text.includes('this quarter')) return 'this_quarter';
  if (text.includes('this year')) return 'this_year';

  const lastN = text.match(/last\s+(\d+)\s+(day|days|week|weeks|month|months|year|years)/);
  if (lastN) {
    return `last_${lastN[1]}_${lastN[2]}`;
  }

  return null;
};

const extractNumbers = (text) => {
  const matches = text.match(/\b\d+(?:\.\d+)?\b/g) || [];
  return matches.slice(0, 8).map((item) => Number(item));
};

exports.analyzePromptNlp = (prompt = '') => {
  const original = String(prompt || '').trim();
  const lower = original.toLowerCase();

  const erpIntent = hasAny(lower, ERP_TERMS);
  const knowledgeIntent = hasAny(lower, KNOWLEDGE_TERMS) || /^\s*(what|why|how|can|should|which|when|where)\b/.test(lower);
  const codingIntent = hasAny(lower, ['code', 'bug', 'debug', 'javascript', 'react', 'node', 'api', 'sql']);

  let intent = 'general_knowledge';
  if (erpIntent && knowledgeIntent) intent = 'hybrid_erp_knowledge';
  else if (erpIntent) intent = 'erp_data_query';
  else if (codingIntent) intent = 'coding_assistant';

  const modules = MODULE_TERMS.filter((term) => lower.includes(term));
  const metrics = METRIC_TERMS.filter((term) => lower.includes(term));
  const timeRange = extractTimeRange(lower);

  return {
    intent,
    erpIntent,
    knowledgeIntent,
    codingIntent,
    hybridIntent: intent === 'hybrid_erp_knowledge',
    language: detectLanguage(original),
    entities: {
      modules,
      metrics,
      timeRange,
      numbers: extractNumbers(lower)
    }
  };
};
