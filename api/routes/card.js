const express = require('express');
const { sql, ensureDbInitialized } = require('../db');
const auth = require('./authMiddleware');
const router = express.Router();

// 获取所有卡片 - 仅用于管理后台，需要认证
router.get('/', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rows: cards } = await sql`
      SELECT * FROM cards
      ORDER BY menu_id, sub_menu_id, sort_order
    `;
    
    // 处理显示 logo
    cards.forEach(card => {
      if (!card.custom_logo_path) {
        card.display_logo = card.logo_url || (card.url.replace(/\/+$/, '') + '/favicon.ico');
      } else {
        card.display_logo = '/uploads/' + card.custom_logo_path;
      }
    });
    
    res.json(cards);
  } catch (error) {
    console.error('Get all cards error:', error);
    res.status(500).json({ 
      error: 'Failed to get cards', 
      details: error.message 
    });
  }
});

// 获取指定菜单的卡片 - 公开访问，不需要认证
router.get('/:menuId', async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { menuId } = req.params;
    const { subMenuId } = req.query;
    
    let cards;
    if (subMenuId) {
      const result = await sql`
        SELECT * FROM cards
        WHERE menu_id = ${menuId} AND sub_menu_id = ${subMenuId}
        ORDER BY sort_order
      `;
      cards = result.rows;
    } else {
      const result = await sql`
        SELECT * FROM cards
        WHERE menu_id = ${menuId}
        ORDER BY sort_order
      `;
      cards = result.rows;
    }
    
    // 处理显示 logo
    cards.forEach(card => {
      if (!card.custom_logo_path) {
        card.display_logo = card.logo_url || (card.url.replace(/\/+$/, '') + '/favicon.ico');
      } else {
        card.display_logo = '/uploads/' + card.custom_logo_path;
      }
    });
    
    res.json(cards);
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ 
      error: 'Failed to get cards', 
      details: error.message 
    });
  }
});

// 新增卡片 - 需要认证
router.post('/', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const {
      menu_id,
      sub_menu_id,
      title,
      url,
      logo_url,
      custom_logo_path,
      description,
      sort_order
    } = req.body;

    const { rows } = await sql`
      INSERT INTO cards (
        menu_id,
        sub_menu_id,
        title,
        url,
        logo_url,
        custom_logo_path,
        description,
        sort_order
      )
      VALUES (
        ${menu_id || null},
        ${sub_menu_id || null},
        ${title},
        ${url},
        ${logo_url || null},
        ${custom_logo_path || null},
        ${description || null},
        ${sort_order || 0}
      )
      RETURNING *
    `;
    
    const newCard = rows[0];
    
    // 处理显示 logo
    if (!newCard.custom_logo_path) {
      newCard.display_logo = newCard.logo_url || (newCard.url.replace(/\/+$/, '') + '/favicon.ico');
    } else {
      newCard.display_logo = '/uploads/' + newCard.custom_logo_path;
    }
    
    res.status(200).json(newCard);
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ 
      error: 'Failed to create card', 
      details: error.message 
    });
  }
});

// 更新卡片 - 需要认证
router.put('/:id', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const cardId = req.params.id;
    const fields = req.body;
    
    // 检查卡片是否存在
    const { rows: existing } = await sql`
      SELECT * FROM cards WHERE id = ${cardId}
    `;
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // 构建更新查询
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    Object.keys(fields).forEach(key => {
      if (key !== 'id') {
        updates.push(`${key} = $${paramIndex}`);
        values.push(fields[key]);
        paramIndex++;
      }
    });
    
    if (updates.length === 0) {
      return res.json({ changed: 0 });
    }
    
    values.push(cardId);
    
    const query = `UPDATE cards SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
    const result = await sql.query(query, values);
    
    res.json({ changed: result.rowCount });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ 
      error: 'Failed to update card', 
      details: error.message 
    });
  }
});

// 删除卡片 - 需要认证
router.delete('/:id', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const cardId = req.params.id;
    
    // 检查卡片是否存在
    const { rows: existing } = await sql`
      SELECT * FROM cards WHERE id = ${cardId}
    `;
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    const { rowCount } = await sql`
      DELETE FROM cards WHERE id = ${cardId}
    `;
    
    res.json({ deleted: rowCount });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ 
      error: 'Failed to delete card', 
      details: error.message 
    });
  }
});

module.exports = router;
