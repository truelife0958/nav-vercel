const test = require('node:test');
const assert = require('node:assert');
const { app } = require('../index');

test.describe('Card API', () => {
  let server;
  let testMenu;

  const { getDb } = require('../db');

  test.before(async () => {
    await getDb(); // Wait for the database to be ready
    server = app.listen(0);
    // Create a menu to associate cards with
    const res = await fetch(`http://localhost:${server.address().port}/api/menus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.TEST_TOKEN}` },
      body: JSON.stringify({ name: 'Card Test Menu', order: 200 })
    });
    const body = await res.json();
    testMenu = { id: body.id };
  });

  test.after(async () => {
    // Clean up the test menu and its cards
    await fetch(`http://localhost:${server.address().port}/api/menus/${testMenu.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${process.env.TEST_TOKEN}` }
    });
    server.close();
  });

  test('should get all cards for a menu', async () => {
    const res = await fetch(`http://localhost:${server.address().port}/api/cards`, {
      headers: { 'Authorization': `Bearer ${process.env.TEST_TOKEN}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body));
  });

  test('should create a new card', async () => {
    const cardData = {
      menu_id: testMenu.id,
      title: 'Test Card',
      url: 'https://example.com',
      logo_url: 'https://example.com/logo.png',
      desc: 'A test card',
      order: 1
    };
    const res = await fetch(`http://localhost:${server.address().port}/api/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.TEST_TOKEN}` },
      body: JSON.stringify(cardData)
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.title, 'Test Card');

    // Clean up
    await fetch(`http://localhost:${server.address().port}/api/cards/${body.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${process.env.TEST_TOKEN}` }
    });
  });

  test('should update a card', async () => {
    // Create a card to update
    const cardData = { menu_id: testMenu.id, title: 'Card to Update', url: 'https://test.com' };
    let res = await fetch(`http://localhost:${server.address().port}/api/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.TEST_TOKEN}` },
      body: JSON.stringify(cardData)
    });
    let body = await res.json();
    const cardId = body.id;

    // Update the card
    res = await fetch(`http://localhost:${server.address().port}/api/cards/${cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.TEST_TOKEN}` },
      body: JSON.stringify({ title: 'Updated Card Title' })
    });
    assert.strictEqual(res.status, 200);
    body = await res.json();
    assert.strictEqual(body.changed, 1);

    // Clean up
    await fetch(`http://localhost:${server.address().port}/api/cards/${cardId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${process.env.TEST_TOKEN}` }
    });
  });

  test('should delete a card', async () => {
    // Create a card to delete
    const cardData = { menu_id: testMenu.id, title: 'Card to Delete', url: 'https://delete.me' };
    let res = await fetch(`http://localhost:${server.address().port}/api/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.TEST_TOKEN}` },
      body: JSON.stringify(cardData)
    });
    let body = await res.json();
    const cardId = body.id;

    // Delete the card
    res = await fetch(`http://localhost:${server.address().port}/api/cards/${cardId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${process.env.TEST_TOKEN}` }
    });
    assert.strictEqual(res.status, 200);

    // Verify it's gone
    res = await fetch(`http://localhost:${server.address().port}/api/cards`, {
      headers: { 'Authorization': `Bearer ${process.env.TEST_TOKEN}` }
    });
    body = await res.json();
    const deletedCard = body.find(c => c.id === cardId);
    assert.ok(!deletedCard);
  });
});