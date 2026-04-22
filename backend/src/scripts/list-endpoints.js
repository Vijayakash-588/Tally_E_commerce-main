const listEndpoints = require('express-list-endpoints');
const app = require('../app');

const endpoints = listEndpoints(app)
  .flatMap((endpoint) =>
    endpoint.methods.map((method) => ({
      method,
      path: endpoint.path,
      middlewares: endpoint.middlewares || []
    }))
  )
  .sort((a, b) => {
    if (a.path === b.path) return a.method.localeCompare(b.method);
    return a.path.localeCompare(b.path);
  });

if (endpoints.length === 0) {
  console.log('No endpoints found.');
  process.exit(0);
}

console.log('METHOD  PATH');
console.log('------  ----');
for (const endpoint of endpoints) {
  console.log(`${endpoint.method.padEnd(6)}  ${endpoint.path}`);
}

console.log(`\nTotal endpoints: ${endpoints.length}`);
