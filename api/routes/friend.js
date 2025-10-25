const express = require('express');
const { sql, ensureDbInitialized } = require('../db');
const auth = require('./authMiddleware');
const router = express.Router();

// 获取所有友情链接 - 公开访问
router.get('/', async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rows: friends } = await sql`
      SELECT * FROM friends
    `;
    
    res.json(friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ 
      error: 'Failed to get friends', 
      details: error.message 
    });
  }
});

// 新增友情链接 - 需要认证
router.post('/', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { title, url, logo } = req.body;
    
    const { rows } = await sql`
      INSERT INTO friends (title, url, logo)
      VALUES (${title}, ${url}, ${logo || null})
      RETURNING *
    `;
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Create friend error:', error);
    res.status(500).json({ 
      error: 'Failed to create friend', 
      details: error.message 
    });
  }
});

// 更新友情链接 - 需要认证
router.put('/:id', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { title, url, logo } = req.body;
    
    const { rowCount } = await sql`
      UPDATE friends 
      SET title = ${title}, url = ${url}, logo = ${logo || null}
      WHERE id = ${req.params.id}
    `;
    
    res.json({ changed: rowCount });
  } catch (error) {
    console.error('Update friend error:', error);
    res.status(500).json({ 
      error: 'Failed to update friend', 
      details: error.message 
    });
  }
});

// 删除友情链接 - 需要认证
router.delete('/:id', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rowCount } = await sql`
      DELETE FROM friends WHERE id = ${req.params.id}
    `;
    
    res.json({ deleted: rowCount });
  } catch (error) {
    console.error('Delete friend error:', error);
    res.status(500).json({ 
      error: 'Failed to delete friend', 
      details: error.message 
    });
  }
});

module.exports = router;
