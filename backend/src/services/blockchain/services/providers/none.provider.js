const anchor = async () => {
  return {
    success: true,
    status: 'SKIPPED',
    reason: 'Blockchain provider set to none'
  };
};

const verify = async (anchorRecord) => {
  return {
    valid: false,
    reason: 'Verification unavailable for provider none',
    anchor: anchorRecord
  };
};

module.exports = {
  name: 'none',
  anchor,
  verify
};
