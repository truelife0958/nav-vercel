const express = require('express');
const { getDb, saveDb } = require('../db');
const auth = require('./authMiddleware');
const { sanitize } = require('./utils');
const router = express.Router({ mergeParams: true });

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

// 获取所有卡片 - 仅用于管理后台
router.get('/', auth, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT * FROM cards ORDER BY menu_id, sub_menu_id, "order"');
    if (!result || result.length === 0) {
      return res.json([]);
    }

    const rows = formatResult(result);

    rows.forEach(card => {
      if (!card.custom_logo_path) {
        card.display_logo = card.logo_url || (card.url.replace(/\/+$/, '') + '/favicon.ico');
      } else {
        card.display_logo = '/uploads/' + card.custom_logo_path;
      }
    });
    res.json(rows);
  } catch (error) {
    console.error('Get all cards error:', error);
    res.status(500).json({ error: 'Failed to get cards', details: error.message });
  }
});

// 获取指定菜单的卡片 - 公开访问，不需要认证
router.get('/:menuId', async (req, res) => {
  try {
    const db = await getDb();
    const { menuId } = req.params;
    const { subMenuId } = req.query;
    
    let query = 'SELECT * FROM cards WHERE menu_id = ?';
    let params = [menuId];
    
    if (subMenuId) {
      query += ' AND sub_menu_id = ?';
      params.push(subMenuId);
    }
    
    query += ' ORDER BY "order"';
    
    const result = db.exec(query, params);
    if (!result || result.length === 0) {
      return res.json([]);
    }

    const rows = formatResult(result);

    rows.forEach(card => {
      if (!card.custom_logo_path) {
        card.display_logo = card.logo_url || (card.url.replace(/\/+$/, '') + '/favicon.ico');
      } else {
        card.display_logo = '/uploads/' + card.custom_logo_path;
      }
    });
    res.json(rows);
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ error: 'Failed to get cards', details: error.message });
  }
});

// 新增、修改、删除卡片需认证
router.post('/', auth, async (req, res) => {
  const db = await getDb();
  const { menu_id, sub_menu_id, title, url, logo_url, custom_logo_path, desc, order } = req.body;

  try {
    // 严格处理所有值，确保没有undefined
    const processedValues = sanitize([
      menu_id,
      sub_menu_id,
      title,
      url,
      logo_url,
      custom_logo_path,
      desc,
      order
    ]);

    db.run('INSERT INTO cards (menu_id, sub_menu_id, title, url, logo_url, custom_logo_path, desc, "order") VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      processedValues);

    const row = db.exec("SELECT last_insert_rowid()");
    const lastID = row[0].values[0][0];
    saveDb();
    const newCardResult = db.exec('SELECT * FROM cards WHERE id = ?', [lastID]);
    const newCard = formatResult(newCardResult)[0];
    res.status(200).json(newCard);
  } catch (error) {
    console.error('Insert card error:', error);
    res.status(500).json({ error: 'Failed to create card', details: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const db = await getDb();
  const cardId = req.params.id;
  const fields = req.body;

  try {
    const existingCardResult = db.exec('SELECT * FROM cards WHERE id = ?', [cardId]);
    if (existingCardResult.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    const setClauses = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = sanitize(Object.values(fields));

    db.run(`UPDATE cards SET ${setClauses} WHERE id = ?`, [...values, cardId]);
    saveDb();
    res.json({ changed: 1 });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Failed to update card', details: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const db = await getDb();
  try {
    const existingCardResult = db.exec('SELECT * FROM cards WHERE id = ?', [req.params.id]);
    if (existingCardResult.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    db.run('DELETE FROM cards WHERE id=?', [req.params.id]);
    saveDb();
    res.json({ deleted: 1 });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Failed to delete card', details: error.message });
  }
});

module.exports = router;
