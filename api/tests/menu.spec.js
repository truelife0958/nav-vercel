const test = require('node:test');
const assert = require('node:assert');
const { app } = require('../index');

test.describe('Menu API', () => {
  let server;

  const { getDb } = require('../db');

  test.before(async () => {
    await getDb(); // Wait for the database to be ready
    server = app.listen(0);
  });

  test.after(() => {
    server.close();
  });

  test('should get all menus', async () => {
    const res = await fetch(`http://localhost:${server.address().port}/api/menus`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body));
  });

  test('should create a new menu', async () => {
    const res = await fetch(`http://localhost:${server.address().port}/api/menus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.TEST_TOKEN}` },
      body: JSON.stringify({ name: 'Test Menu', sort_order: 100 })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.name, 'Test Menu');

    // Clean up
    await fetch(`http://localhost:${server.address().port}/api/menus/${body.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${process.env.TEST_TOKEN}` }
    });
  });

  test('should update a menu', async () => {
    // Create a menu to update
    let res = await fetch(`http://localhost:${server.address().port}/api/menus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.TEST_TOKEN}` },
      body: JSON.stringify({ name: 'Menu to Update', sort_order: 1 })
    });
    let body = await res.json();
    const menuId = body.id;

    // Update the menu
    res = await fetch(`http://localhost:${server.address().port}/api/menus/${menuId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.TEST_TOKEN}` },
      body: JSON.stringify({ name: 'Updated Menu Name' })
    });
    assert.strictEqual(res.status, 200);
    body = await res.json();
    assert.strictEqual(body.changed, 1);

    // Clean up
    await fetch(`http://localhost:${server.address().port}/api/menus/${menuId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${process.env.TEST_TOKEN}` }
    });
  });

  test('should delete a menu', async () => {
    // Create a menu to delete
    let res = await fetch(`http://localhost:${server.address().port}/api/menus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.TEST_TOKEN}` },
      body: JSON.stringify({ name: 'Menu to Delete', sort_order: 1 })
    });
    let body = await res.json();
    const menuId = body.id;

    // Delete the menu
    res = await fetch(`http://localhost:${server.address().port}/api/menus/${menuId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${process.env.TEST_TOKEN}` }
    });
    assert.strictEqual(res.status, 200);

    // Verify it's gone
    res = await fetch(`http://localhost:${server.address().port}/api/menus`);
    body = await res.json();
    const deletedMenu = body.find(m => m.id === menuId);
    assert.ok(!deletedMenu);
  });
});