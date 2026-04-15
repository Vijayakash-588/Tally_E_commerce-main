const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

exports.calculateConfidence = ({ prompt, evidenceCount, aiReply }) => {
  let score = 0.45;

  if ((prompt || '').trim().length > 12) score += 0.1;
  if (evidenceCount > 0) score += 0.25;
  if (evidenceCount >= 2) score += 0.1;
  if ((aiReply || '').length > 60) score += 0.05;

  const uncertaintySignals = ['not sure', 'cannot verify', 'might be', 'may be'];
  if (uncertaintySignals.some((s) => (aiReply || '').toLowerCase().includes(s))) {
    score -= 0.15;
  }

  return Number(clamp(score, 0.05, 0.98).toFixed(2));
};

exports.buildWarnings = ({ dataQuery, evidenceCount, confidence }) => {
  const warnings = [];

  if (dataQuery && evidenceCount === 0) {
    warnings.push('No ERP evidence could be attached for this data-oriented query.');
  }

  if (confidence < 0.55) {
    warnings.push('Low confidence response. Validate business-critical values before acting.');
  }

  return warnings;
};

exports.buildSafeFallback = (prompt) => {
  const lower = (prompt || '').toLowerCase();

  if (lower.includes('stock') || lower.includes('inventory')) {
    return 'I cannot verify inventory confidence right now. Please open Stock Levels and confirm current quantities before making adjustments.';
  }

  if (lower.includes('invoice') || lower.includes('payment')) {
    return 'I cannot confidently validate invoice/payment details right now. Please review invoice status in the Invoices module before taking action.';
  }

  return 'I do not have enough confidence to provide a reliable answer. Please verify from the relevant ERP module and try again with a more specific question.';
};

exports.buildEvidenceFallback = ({ prompt, evidence = [], actionSuggestions = [], providerErrorMessage = '' }) => {
  const lower = (prompt || '').toLowerCase();

  if (providerErrorMessage && /quota|billing/i.test(providerErrorMessage)) {
    return providerErrorMessage;
  }

  if (evidence.length > 0) {
    const highlights = evidence
      .slice(0, 3)
      .map((item) => `- ${item.title}: ${item.details}`)
      .join('\n');

    return [
      'The AI provider is temporarily unavailable, but here is what I can confirm from ERP data:',
      highlights,
      'Use these verified values and open the suggested module to continue.'
    ].join('\n\n');
  }

  if (lower.includes('sales') || lower.includes('inventory') || lower.includes('stock') || lower.includes('invoice')) {
    return 'The AI provider is temporarily unavailable and I could not fetch enough ERP evidence for this request. Please retry in a minute or open the related ERP module to verify the latest values.';
  }

  if (actionSuggestions.length > 0) {
    return `The AI provider is temporarily unavailable. Please retry shortly, or continue from: ${actionSuggestions[0].label}.`;
  }

  return 'The AI provider is temporarily unavailable. Please retry shortly.';
};
