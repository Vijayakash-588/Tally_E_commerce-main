const crypto = require('crypto');
const prisma = require('../../../prisma');
const { getProvider, resolveProviderName } = require('./providers/provider.factory');

const ANCHOR_STATUSES = ['PENDING', 'CONFIRMED', 'FAILED', 'SKIPPED'];

const getFeatureFlags = () => ({
  blockchainEnabled: String(process.env.BLOCKCHAIN_ENABLED || 'false').toLowerCase() === 'true',
  ethereumEnabled: String(process.env.ETHEREUM_ENABLED || 'false').toLowerCase() === 'true'
});

const stableStringify = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }

  return JSON.stringify(value);
};

const hashPayload = (payload) => {
  const canonical = stableStringify(payload);
  const digest = crypto.createHash('sha256').update(canonical).digest('hex');
  return `0x${digest}`;
};

const normalizeStatus = (value) => {
  if (!value) return undefined;
  const normalized = String(value).trim().toUpperCase();
  return ANCHOR_STATUSES.includes(normalized) ? normalized : undefined;
};

const createAnchor = async (data) => {
  return prisma.ethereum_anchors.create({ data });
};

const anchorEntity = async ({ entityType, entityId, payload, createdBy = null }) => {
  const { blockchainEnabled, ethereumEnabled } = getFeatureFlags();

  if (!blockchainEnabled) {
    return {
      success: true,
      skipped: true,
      message: 'Blockchain feature disabled'
    };
  }

  const providerName = resolveProviderName();
  if (providerName === 'ethereum' && !ethereumEnabled) {
    const payloadHash = hashPayload(payload || {});

    const skipped = await createAnchor({
      entity_type: entityType,
      entity_id: String(entityId),
      payload_hash: payloadHash,
      status: 'SKIPPED',
      error_message: 'Ethereum feature disabled',
      created_by: createdBy,
      raw_response: { payload, provider: providerName }
    });

    return { success: true, skipped: true, anchor: skipped };
  }

  const payloadHash = hashPayload(payload || {});

  const duplicateWindowStart = new Date(Date.now() - 5 * 60 * 1000);
  const existingAnchor = await prisma.ethereum_anchors.findFirst({
    where: {
      entity_type: entityType,
      entity_id: String(entityId),
      payload_hash: payloadHash,
      created_at: {
        gte: duplicateWindowStart
      },
      status: {
        in: ['PENDING', 'CONFIRMED', 'SKIPPED']
      }
    },
    orderBy: { created_at: 'desc' }
  });

  if (existingAnchor) {
    return {
      success: true,
      duplicate: true,
      message: 'Duplicate anchor request ignored',
      anchor: existingAnchor
    };
  }

  const provider = getProvider();
  const result = await provider.anchor({
    entityType,
    entityId,
    payloadHash,
    payload
  });

  const anchor = await createAnchor({
    entity_type: entityType,
    entity_id: String(entityId),
    payload_hash: payloadHash,
    chain_id: result.chainId || null,
    network: result.network || provider.name,
    tx_hash: result.txHash || null,
    block_number: result.blockNumber ? BigInt(result.blockNumber) : null,
    contract_address: result.contractAddress || null,
    status: result.status || (result.success ? 'CONFIRMED' : 'FAILED'),
    error_message: result.error || result.reason || null,
    created_by: createdBy,
    confirmed_at: result.confirmedAt || null,
    raw_response: {
      ...(result.rawResponse || {}),
      payload,
      provider: provider.name
    }
  });

  return {
    success: Boolean(result.success),
    anchor,
    provider: provider.name,
    skipped: result.status === 'SKIPPED',
    error: result.error
  };
};

const getAnchors = async ({ entityType, entityId, status, page = 1, pageSize = 30 } = {}) => {
  const parsedPage = Number(page);
  const parsedPageSize = Number(pageSize);

  const safePage = Number.isFinite(parsedPage) ? Math.max(parsedPage, 1) : 1;
  const safePageSize = Number.isFinite(parsedPageSize) ? Math.min(Math.max(parsedPageSize, 1), 100) : 30;
  const safeStatus = normalizeStatus(status);

  const where = {
    entity_type: entityType || undefined,
    entity_id: entityId || undefined,
    status: safeStatus || undefined
  };

  const [items, total] = await Promise.all([
    prisma.ethereum_anchors.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (safePage - 1) * safePageSize,
      take: safePageSize
    }),
    prisma.ethereum_anchors.count({ where })
  ]);

  const totalPages = total === 0 ? 1 : Math.ceil(total / safePageSize);

  return {
    items,
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1
    }
  };
};

const getAnchorStatuses = () => {
  return [...ANCHOR_STATUSES];
};

const getAnchorById = async (id) => {
  const anchor = await prisma.ethereum_anchors.findUnique({ where: { id } });
  if (!anchor) {
    throw new Error('Anchor not found');
  }

  return anchor;
};

const verifyAnchorById = async (id) => {
  const anchor = await getAnchorById(id);
  const providerName = anchor.raw_response?.provider || resolveProviderName();

  if (providerName === 'none') {
    return {
      valid: false,
      reason: 'Verification unavailable for provider none',
      anchor
    };
  }

  const provider = getProvider();

  if (provider.name !== providerName && providerName === 'ethereum') {
    const { blockchainEnabled, ethereumEnabled } = getFeatureFlags();
    if (!blockchainEnabled || !ethereumEnabled) {
      return {
        valid: false,
        reason: 'Ethereum verification disabled',
        anchor
      };
    }
  }

  return provider.verify(anchor);
};

const verifyEntity = async (entityType, entityId) => {
  const anchors = await prisma.ethereum_anchors.findMany({
    where: {
      entity_type: entityType,
      entity_id: String(entityId)
    },
    orderBy: { created_at: 'desc' },
    take: 1
  });

  if (!anchors.length) {
    return {
      valid: false,
      reason: 'No anchors found for entity'
    };
  }

  return verifyAnchorById(anchors[0].id);
};

const getHealth = async () => {
  const { blockchainEnabled, ethereumEnabled } = getFeatureFlags();

  const grouped = await prisma.ethereum_anchors.groupBy({
    by: ['status'],
    _count: { _all: true }
  });

  const totals = grouped.reduce((acc, row) => {
    acc[row.status] = row._count._all;
    return acc;
  }, {});

  const [lastAnchor, failedLast24h] = await Promise.all([
    prisma.ethereum_anchors.findFirst({
      orderBy: { created_at: 'desc' }
    }),
    prisma.ethereum_anchors.count({
      where: {
        status: 'FAILED',
        created_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
  ]);

  const totalAnchors = Object.values(totals).reduce((acc, count) => acc + count, 0);
  const confirmedAnchors = totals.CONFIRMED || 0;
  const successRate = totalAnchors > 0 ? Number(((confirmedAnchors / totalAnchors) * 100).toFixed(2)) : 0;

  return {
    feature: {
      blockchainEnabled,
      ethereumEnabled,
      provider: resolveProviderName()
    },
    totals,
    metrics: {
      totalAnchors,
      successRate,
      failedLast24h,
      lastAnchorAt: lastAnchor?.created_at || null
    }
  };
};

const retryFailedAnchors = async (limit = 25) => {
  const failedAnchors = await prisma.ethereum_anchors.findMany({
    where: { status: 'FAILED' },
    orderBy: { created_at: 'asc' },
    take: Number(limit)
  });

  let retried = 0;
  let succeeded = 0;
  let failed = 0;

  for (const row of failedAnchors) {
    retried += 1;

    const result = await anchorEntity({
      entityType: row.entity_type,
      entityId: row.entity_id,
      payload: row.raw_response?.payload || {},
      createdBy: row.created_by || null
    });

    if (result.success) {
      succeeded += 1;
    } else {
      failed += 1;
    }
  }

  return {
    retried,
    succeeded,
    failed
  };
};

module.exports = {
  anchorEntity,
  getAnchors,
  getAnchorStatuses,
  getAnchorById,
  verifyAnchorById,
  verifyEntity,
  getHealth,
  retryFailedAnchors,
  hashPayload
};
