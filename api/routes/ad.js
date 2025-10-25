const express = require('express');
const { getDb, saveDb } = require('../db');
const auth = require('./authMiddleware');
const { sanitize } = require('./utils');
const router = express.Router();

// Helper to convert sql.js output to a more usable format
const formatResult = (res) => {
  if (!res || res.length === 0) {
    return [];
  }
  const { columns, values } = res[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
};

// 获取广告
router.get('/', async (req, res) => {
  const db = await getDb();
  const { page, pageSize } = req.query;
  if (!page && !pageSize) {
    const result = db.exec('SELECT * FROM ads');
    res.json(formatResult(result));
  } else {
    const pageNum = parseInt(page) || 1;
    const size = parseInt(pageSize) || 10;
    const offset = (pageNum - 1) * size;
    const totalResult = db.exec('SELECT COUNT(*) as total FROM ads');
    const total = totalResult[0].values[0][0];
    const rowsResult = db.exec(`SELECT * FROM ads LIMIT ${size} OFFSET ${offset}`);
    res.json({
      total,
      page: pageNum,
      pageSize: size,
      data: formatResult(rowsResult)
    });
  }
});

// 新增广告
router.post('/', auth, async (req, res) => {
  const db = await getDb();
  const { position, img, url } = req.body;
  db.run('INSERT INTO ads (position, img, url) VALUES (?, ?, ?)', [position, img, url]);
  const row = db.exec("SELECT last_insert_rowid()");
  saveDb();
  res.json({ id: row[0].values[0][0] });
});

// 修改广告
router.put('/:id', auth, async (req, res) => {
  const db = await getDb();
  const { img, url } = req.body;
  try {
    db.run('UPDATE ads SET img=?, url=? WHERE id=?', sanitize([img, url, req.params.id]));
    saveDb();
    res.json({ changed: db.getRowsModified() });
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({ error: 'Failed to update ad', details: error.message });
  }
});

// 删除广告
router.delete('/:id', auth, async (req, res) => {
  const db = await getDb();
  try {
    db.run('DELETE FROM ads WHERE id=?', [req.params.id]);
    saveDb();
    res.json({ deleted: db.getRowsModified() });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({ error: 'Failed to delete ad', details: error.message });
  }
});

module.exports = router;
