const { ethers } = require('ethers');

const DEFAULT_ABI = [
  'function anchorDocument(string entityType, string entityId, bytes32 payloadHash) external returns (bytes32)'
];

const getEthereumConfig = () => ({
  rpcUrl: process.env.ETHEREUM_RPC_URL,
  privateKey: process.env.ETHEREUM_PRIVATE_KEY,
  contractAddress: process.env.ETHEREUM_CONTRACT_ADDRESS,
  network: process.env.ETHEREUM_NETWORK || 'sepolia',
  chainId: Number(process.env.ETHEREUM_CHAIN_ID || 11155111),
  confirmations: Number(process.env.ETHEREUM_CONFIRMATIONS || 1),
  methodName: process.env.ETHEREUM_CONTRACT_METHOD || 'anchorDocument'
});

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

const anchor = async ({ entityType, entityId, payloadHash }) => {
  try {
    const { contract, config } = getSignerAndContract();
    const tx = await contract[config.methodName](String(entityType), String(entityId), payloadHash);
    const receipt = await tx.wait(config.confirmations);

    return {
      success: true,
      status: 'CONFIRMED',
      chainId: config.chainId,
      network: config.network,
      txHash: tx.hash,
      blockNumber: receipt?.blockNumber || null,
      contractAddress: config.contractAddress,
      confirmedAt: new Date(),
      rawResponse: {
        transactionHash: tx.hash,
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString?.() || null
      }
    };
  } catch (error) {
    const config = getEthereumConfig();

    return {
      success: false,
      status: 'FAILED',
      chainId: config.chainId,
      network: config.network,
      contractAddress: config.contractAddress,
      error: error.message
    };
  }
};

const verify = async (anchorRecord) => {
  if (!anchorRecord.tx_hash) {
    return {
      valid: false,
      reason: 'Anchor has no on-chain transaction',
      anchor: anchorRecord
    };
  }

  const { provider, config } = getSignerAndContract();
  const receipt = await provider.getTransactionReceipt(anchorRecord.tx_hash);

  if (!receipt) {
    return {
      valid: false,
      reason: 'Transaction receipt not found',
      anchor: anchorRecord
    };
  }

  const valid = receipt.status === 1
    && String(receipt.to || '').toLowerCase() === String(config.contractAddress || '').toLowerCase();

  return {
    valid,
    reason: valid ? 'Anchor verified on Ethereum' : 'Receipt status/contract mismatch',
    anchor: anchorRecord,
    onChain: {
      blockNumber: receipt.blockNumber,
      transactionHash: receipt.hash,
      status: receipt.status
    }
  };
};

module.exports = {
  name: 'ethereum',
  anchor,
  verify
};
