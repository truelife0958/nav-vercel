const express = require('express');
const { sql, ensureDbInitialized } = require('../db');
const auth = require('./authMiddleware');
const router = express.Router();

// 获取所有广告 - 公开访问
router.get('/', async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rows: ads } = await sql`
      SELECT * FROM ads
    `;
    
    res.json(ads);
  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({ 
      error: 'Failed to get ads', 
      details: error.message 
    });
  }
});

// 新增广告 - 需要认证
router.post('/', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { position, img, url } = req.body;
    
    const { rows } = await sql`
      INSERT INTO ads (position, img, url)
      VALUES (${position}, ${img}, ${url})
      RETURNING *
    `;
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({ 
      error: 'Failed to create ad', 
      details: error.message 
    });
  }
});

// 更新广告 - 需要认证
router.put('/:id', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { position, img, url } = req.body;
    
    const { rowCount } = await sql`
      UPDATE ads 
      SET position = ${position}, img = ${img}, url = ${url}
      WHERE id = ${req.params.id}
    `;
    
    res.json({ changed: rowCount });
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({ 
      error: 'Failed to update ad', 
      details: error.message 
    });
  }
});

// 删除广告 - 需要认证
router.delete('/:id', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rowCount } = await sql`
      DELETE FROM ads WHERE id = ${req.params.id}
    `;
    
    res.json({ deleted: rowCount });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({ 
      error: 'Failed to delete ad', 
      details: error.message 
    });
  }
});

module.exports = router;
