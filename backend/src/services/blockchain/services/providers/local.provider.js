const prisma = require('../../../../prisma');

const anchor = async ({ payloadHash }) => {
  const previous = await prisma.ethereum_anchors.findFirst({
    where: {
      status: 'CONFIRMED'
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  return {
    success: true,
    status: 'CONFIRMED',
    network: 'local-hashchain',
    confirmedAt: new Date(),
    rawResponse: {
      local: {
        algorithm: 'sha256',
        previousPayloadHash: previous?.payload_hash || null,
        linkedAt: new Date().toISOString()
      }
    }
  };
};

const verify = async (anchorRecord) => {
  const previous = await prisma.ethereum_anchors.findFirst({
    where: {
      status: 'CONFIRMED',
      created_at: {
        lt: anchorRecord.created_at || new Date()
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  const expectedPrevHash = previous?.payload_hash || null;
  const storedPrevHash = anchorRecord.raw_response?.local?.previousPayloadHash || null;
  const valid = expectedPrevHash === storedPrevHash;

  return {
    valid,
    reason: valid ? 'Anchor verified in local hash chain' : 'Hash-chain link mismatch',
    anchor: anchorRecord,
    localChain: {
      previousPayloadHash: storedPrevHash,
      expectedPreviousPayloadHash: expectedPrevHash,
      algorithm: anchorRecord.raw_response?.local?.algorithm || 'sha256'
    }
  };
};

module.exports = {
  name: 'local',
  anchor,
  verify
};
