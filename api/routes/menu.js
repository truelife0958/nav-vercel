const express = require('express');
const { sql, ensureDbInitialized } = require('../db');
const auth = require('./authMiddleware');
const router = express.Router();

// 获取所有菜单（包含子菜单）- 公开访问
router.get('/', async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { page, pageSize } = req.query;
    
    if (!page && !pageSize) {
      // 获取主菜单
      const { rows: menus } = await sql`
        SELECT * FROM menus ORDER BY sort_order
      `;

      // 为每个菜单获取子菜单
      const menusWithSubMenus = await Promise.all(
        menus.map(async (menu) => {
          const { rows: subMenus } = await sql`
            SELECT * FROM sub_menus
            WHERE parent_id = ${menu.id}
            ORDER BY sort_order
          `;
          return { ...menu, subMenus };
        })
      );
      
      res.json(menusWithSubMenus);
    } else {
      // 分页查询
      const pageNum = parseInt(page) || 1;
      const size = parseInt(pageSize) || 10;
      const offset = (pageNum - 1) * size;
      
      const { rows: totalResult } = await sql`
        SELECT COUNT(*) as total FROM menus
      `;
      const total = parseInt(totalResult[0].total);
      
      const { rows: menus } = await sql`
        SELECT * FROM menus
        ORDER BY sort_order
        LIMIT ${size} OFFSET ${offset}
      `;
      
      res.json({
        total,
        page: pageNum,
        pageSize: size,
        data: menus
      });
    }
  } catch (error) {
    console.error('Get menus error:', error);
    res.status(500).json({ 
      error: 'Failed to get menus', 
      details: error.message 
    });
  }
});

// 获取指定菜单的子菜单 - 公开访问
router.get('/:id/submenus', async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rows: subMenus } = await sql`
      SELECT * FROM sub_menus
      WHERE parent_id = ${req.params.id}
      ORDER BY sort_order
    `;
    
    res.json(subMenus);
  } catch (error) {
    console.error('Get submenus error:', error);
    res.status(500).json({ 
      error: 'Failed to get submenus', 
      details: error.message 
    });
  }
});

// 新增菜单 - 需要认证
router.post('/', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { name, sort_order } = req.body;
    const { rows } = await sql`
      INSERT INTO menus (name, sort_order)
      VALUES (${name}, ${sort_order || 0})
      RETURNING id
    `;
    
    res.json({ id: rows[0].id });
  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json({ 
      error: 'Failed to create menu', 
      details: error.message 
    });
  }
});

// 更新菜单 - 需要认证
router.put('/:id', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { name, sort_order } = req.body;
    const { rowCount } = await sql`
      UPDATE menus
      SET name = ${name}, sort_order = ${sort_order || 0}
      WHERE id = ${req.params.id}
    `;
    
    res.json({ changed: rowCount });
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ 
      error: 'Failed to update menu', 
      details: error.message 
    });
  }
});

// 删除菜单 - 需要认证
router.delete('/:id', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rowCount } = await sql`
      DELETE FROM menus WHERE id = ${req.params.id}
    `;
    
    res.json({ deleted: rowCount });
  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({ 
      error: 'Failed to delete menu', 
      details: error.message 
    });
  }
});

// 新增子菜单 - 需要认证
router.post('/:id/submenus', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { name, sort_order } = req.body;
    const { rows } = await sql`
      INSERT INTO sub_menus (parent_id, name, sort_order)
      VALUES (${req.params.id}, ${name}, ${sort_order || 0})
      RETURNING id
    `;
    
    res.json({ id: rows[0].id });
  } catch (error) {
    console.error('Create submenu error:', error);
    res.status(500).json({ 
      error: 'Failed to create submenu', 
      details: error.message 
    });
  }
});

// 更新子菜单 - 需要认证
router.put('/submenus/:id', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { name, sort_order } = req.body;
    const { rowCount } = await sql`
      UPDATE sub_menus
      SET name = ${name}, sort_order = ${sort_order || 0}
      WHERE id = ${req.params.id}
    `;
    
    res.json({ changed: rowCount });
  } catch (error) {
    console.error('Update submenu error:', error);
    res.status(500).json({ 
      error: 'Failed to update submenu', 
      details: error.message 
    });
  }
});

// 删除子菜单 - 需要认证
router.delete('/submenus/:id', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rowCount } = await sql`
      DELETE FROM sub_menus WHERE id = ${req.params.id}
    `;
    
    res.json({ deleted: rowCount });
  } catch (error) {
    console.error('Delete submenu error:', error);
    res.status(500).json({ 
      error: 'Failed to delete submenu', 
      details: error.message 
    });
  }
});

module.exports = router;
