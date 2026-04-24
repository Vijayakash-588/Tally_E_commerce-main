const ethereumProvider = require('./ethereum.provider');
const localProvider = require('./local.provider');
const noneProvider = require('./none.provider');

const resolveProviderName = () => {
  return String(process.env.BLOCKCHAIN_PROVIDER || 'ethereum').trim().toLowerCase();
};

const getProvider = () => {
  const providerName = resolveProviderName();

  if (providerName === 'local') return localProvider;
  if (providerName === 'none') return noneProvider;

  return ethereumProvider;
};

module.exports = {
  getProvider,
  resolveProviderName
};
