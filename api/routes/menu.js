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

// 获取所有菜单（包含子菜单）
router.get('/', async (req, res) => {
  const db = await getDb();
  const { page, pageSize } = req.query;
  if (!page && !pageSize) {
    // 获取主菜单
    const menusResult = db.exec('SELECT * FROM menus ORDER BY "order"');
    const menus = menusResult.length > 0 ? formatResult(menusResult) : [];
    
    const menusWithSubMenus = menus.map(menu => {
      const subMenusResult = db.exec(`SELECT * FROM sub_menus WHERE parent_id = ${menu.id} ORDER BY "order"`);
      return { ...menu, subMenus: formatResult(subMenusResult) };
    });
    res.json(menusWithSubMenus);
  } else {
    const pageNum = parseInt(page) || 1;
    const size = parseInt(pageSize) || 10;
    const offset = (pageNum - 1) * size;
    const totalResult = db.exec('SELECT COUNT(*) as total FROM menus');
    const total = totalResult[0].values[0][0];
    const rowsResult = db.exec(`SELECT * FROM menus ORDER BY "order" LIMIT ${size} OFFSET ${offset}`);
    res.json({
      total,
      page: pageNum,
      pageSize: size,
      data: formatResult(rowsResult)
    });
  }
});

// 获取指定菜单的子菜单
router.get('/:id/submenus', async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM sub_menus WHERE parent_id = ${req.params.id} ORDER BY "order"`);
  res.json(formatResult(result));
});

// 新增、修改、删除菜单需认证
router.post('/', auth, async (req, res) => {
  const db = await getDb();
  const { name, order } = req.body;
  db.run('INSERT INTO menus (name, "order") VALUES (?, ?)', [name, order || 0]);
  const row = db.exec("SELECT last_insert_rowid()");
  saveDb();
  res.json({ id: row[0].values[0][0] });
});

router.put('/:id', auth, async (req, res) => {
  const db = await getDb();
  const { name, order } = req.body;
  try {
    db.run('UPDATE menus SET name=?, "order"=? WHERE id=?', sanitize([name, order || 0, req.params.id]));
    saveDb();
    res.json({ changed: db.getRowsModified() });
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ error: 'Failed to update menu', details: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const db = await getDb();
  try {
    db.run('DELETE FROM menus WHERE id=?', [req.params.id]);
    saveDb();
    res.json({ deleted: db.getRowsModified() });
  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({ error: 'Failed to delete menu', details: error.message });
  }
});

// 子菜单相关API
router.post('/:id/submenus', auth, async (req, res) => {
  const db = await getDb();
  const { name, order } = req.body;
  db.run('INSERT INTO sub_menus (parent_id, name, "order") VALUES (?, ?, ?)',
    [req.params.id, name, order || 0]);
  const row = db.exec("SELECT last_insert_rowid()");
  saveDb();
  res.json({ id: row[0].values[0][0] });
});

router.put('/submenus/:id', auth, async (req, res) => {
  const db = await getDb();
  const { name, order } = req.body;
  try {
    db.run('UPDATE sub_menus SET name=?, "order"=? WHERE id=?', sanitize([name, order || 0, req.params.id]));
    saveDb();
    res.json({ changed: db.getRowsModified() });
  } catch (error) {
    console.error('Update sub-menu error:', error);
    res.status(500).json({ error: 'Failed to update sub-menu', details: error.message });
  }
});

router.delete('/submenus/:id', auth, async (req, res) => {
  const db = await getDb();
  try {
    db.run('DELETE FROM sub_menus WHERE id=?', [req.params.id]);
    saveDb();
    res.json({ deleted: db.getRowsModified() });
  } catch (error) {
    console.error('Delete sub-menu error:', error);
    res.status(500).json({ error: 'Failed to delete sub-menu', details: error.message });
  }
});

module.exports = router;
