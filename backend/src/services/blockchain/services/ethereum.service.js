const crypto = require('crypto');
const { ethers } = require('ethers');
const prisma = require('../../../prisma');

const DEFAULT_ABI = [
  'function anchorDocument(string entityType, string entityId, bytes32 payloadHash) external returns (bytes32)'
];

const getFeatureFlags = () => ({
  blockchainEnabled: String(process.env.BLOCKCHAIN_ENABLED || 'false').toLowerCase() === 'true',
  ethereumEnabled: String(process.env.ETHEREUM_ENABLED || 'false').toLowerCase() === 'true'
});

const getEthereumConfig = () => ({
  rpcUrl: process.env.ETHEREUM_RPC_URL,
  privateKey: process.env.ETHEREUM_PRIVATE_KEY,
  contractAddress: process.env.ETHEREUM_CONTRACT_ADDRESS,
  network: process.env.ETHEREUM_NETWORK || 'sepolia',
  chainId: Number(process.env.ETHEREUM_CHAIN_ID || 11155111),
  confirmations: Number(process.env.ETHEREUM_CONFIRMATIONS || 1),
  methodName: process.env.ETHEREUM_CONTRACT_METHOD || 'anchorDocument'
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

const getSignerAndContract = () => {
  const config = getEthereumConfig();

  if (!config.rpcUrl || !config.privateKey || !config.contractAddress) {
    throw new Error('Ethereum configuration is incomplete. Set ETHEREUM_RPC_URL, ETHEREUM_PRIVATE_KEY, ETHEREUM_CONTRACT_ADDRESS');
  }

  const provider = new ethers.JsonRpcProvider(config.rpcUrl, config.chainId);
  const wallet = new ethers.Wallet(config.privateKey, provider);
  const contract = new ethers.Contract(config.contractAddress, DEFAULT_ABI, wallet);

  return { provider, contract, config };
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

  const payloadHash = hashPayload(payload || {});

  if (!ethereumEnabled) {
    const skipped = await createAnchor({
      entity_type: entityType,
      entity_id: String(entityId),
      payload_hash: payloadHash,
      status: 'SKIPPED',
      error_message: 'Ethereum feature disabled',
      created_by: createdBy,
      raw_response: { payload }
    });

    return { success: true, skipped: true, anchor: skipped };
  }

  try {
    const { contract, config } = getSignerAndContract();
    const tx = await contract[config.methodName](String(entityType), String(entityId), payloadHash);
    const receipt = await tx.wait(config.confirmations);

    const anchor = await createAnchor({
      entity_type: entityType,
      entity_id: String(entityId),
      payload_hash: payloadHash,
      chain_id: config.chainId,
      network: config.network,
      tx_hash: tx.hash,
      block_number: receipt?.blockNumber ? BigInt(receipt.blockNumber) : null,
      contract_address: config.contractAddress,
      status: 'CONFIRMED',
      created_by: createdBy,
      confirmed_at: new Date(),
      raw_response: {
        transactionHash: tx.hash,
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString?.() || null
      }
    });

    return { success: true, anchor };
  } catch (error) {
    const config = getEthereumConfig();

    const failed = await createAnchor({
      entity_type: entityType,
      entity_id: String(entityId),
      payload_hash: payloadHash,
      chain_id: config.chainId,
      network: config.network,
      contract_address: config.contractAddress,
      status: 'FAILED',
      error_message: error.message,
      created_by: createdBy,
      raw_response: { payload }
    });

    return { success: false, anchor: failed, error: error.message };
  }
};

const getAnchors = async ({ entityType, entityId, limit = 50 } = {}) => {
  return prisma.ethereum_anchors.findMany({
    where: {
      entity_type: entityType || undefined,
      entity_id: entityId || undefined
    },
    orderBy: { created_at: 'desc' },
    take: Number(limit)
  });
};

const verifyAnchorById = async (id) => {
  const anchor = await prisma.ethereum_anchors.findUnique({ where: { id } });
  if (!anchor) {
    throw new Error('Anchor not found');
  }

  if (!anchor.tx_hash) {
    return {
      valid: false,
      reason: 'Anchor has no on-chain transaction',
      anchor
    };
  }

  const { ethereumEnabled } = getFeatureFlags();
  if (!ethereumEnabled) {
    return {
      valid: false,
      reason: 'Ethereum verification disabled',
      anchor
    };
  }

  const { provider, config } = getSignerAndContract();
  const receipt = await provider.getTransactionReceipt(anchor.tx_hash);

  if (!receipt) {
    return {
      valid: false,
      reason: 'Transaction receipt not found',
      anchor
    };
  }

  const valid = receipt.status === 1 && String(receipt.to || '').toLowerCase() === String(config.contractAddress || '').toLowerCase();
  return {
    valid,
    reason: valid ? 'Anchor verified on Ethereum' : 'Receipt status/contract mismatch',
    anchor,
    onChain: {
      blockNumber: receipt.blockNumber,
      transactionHash: receipt.hash,
      status: receipt.status
    }
  };
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

  return {
    feature: {
      blockchainEnabled,
      ethereumEnabled
    },
    totals
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
  verifyAnchorById,
  verifyEntity,
  getHealth,
  retryFailedAnchors,
  hashPayload
};
