const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { app } = require('../index');

const { getDb } = require('../db');

test('GET /health 应返回运行状态', async (t) => {
  await getDb(); // Wait for the database to be ready
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  t.teardown(() => server.close());

  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/health`);

  assert.equal(response.status, 200);
  const payload = await response.json();

  assert.equal(payload.status, 'ok');
  assert.ok(payload.timestamp);
  assert.ok(payload.uptime >= 0);
});
