# Bug 修复: 批量移动失败 (500 错误)

## 问题描述

在 CardManage.vue 页面中,使用批量移动功能时出现以下错误:
```
批量移动失败：Request failed with status code 500
```

## 根本原因

后端 API (`api/routes/card.js`) 的 `PUT /:id` 路由在处理更新卡片请求时,没有正确处理 `undefined` 值。

### 问题详情:

1. **前端代码** (CardManage.vue 第 387-395 行):
   ```javascript
   await apiUpdateCard(card.id, {
     menu_id: newMenuId,
     sub_menu_id: newSubMenuId,
     title: card.title,
     url: card.url,
     logo_url: card.logo_url,      // 可能是 undefined
     desc: card.desc,                // 可能是 undefined
     order: card.order
     // 缺少 custom_logo_path 字段
   });
   ```

2. **后端代码** (card.js 第 90-97 行 - 修复前):
   ```javascript
   router.put('/:id', auth, (req, res) => {
     const db = getDb();
     const { menu_id, sub_menu_id, title, url, logo_url, custom_logo_path, desc, order } = req.body;
     db.run('UPDATE cards SET menu_id=?, sub_menu_id=?, title=?, url=?, logo_url=?, custom_logo_path=?, desc=?, "order"=? WHERE id=?',
       [menu_id, sub_menu_id || null, title, url, logo_url, custom_logo_path, desc, order || 0, req.params.id]);
     // ❌ 没有错误处理
     // ❌ undefined 值没有转换为 null
     saveDb();
     res.json({ changed: 1 });
   });
   ```

3. **SQL 执行问题**:
   - 当 `logo_url`、`custom_logo_path` 或 `desc` 是 `undefined` 时
   - SQL.js 无法处理 `undefined` 值
   - 导致 SQL 执行失败,抛出 500 错误

## 解决方案

### 修复后的代码 (card.js 第 90-116 行):

```javascript
router.put('/:id', auth, (req, res) => {
  const db = getDb();
  const { menu_id, sub_menu_id, title, url, logo_url, custom_logo_path, desc, order } = req.body;

  try {
    // ✅ 处理所有值,确保 undefined 转换为 null
    const processedValues = [
      menu_id,
      sub_menu_id || null,
      title,
      url,
      logo_url || null,           // ✅ undefined → null
      custom_logo_path || null,   // ✅ undefined → null
      desc || null,                // ✅ undefined → null
      order || 0,
      req.params.id
    ].map(val => val === undefined ? null : val);  // ✅ 双重保险

    db.run('UPDATE cards SET menu_id=?, sub_menu_id=?, title=?, url=?, logo_url=?, custom_logo_path=?, desc=?, "order"=? WHERE id=?',
      processedValues);
    saveDb();
    res.json({ changed: 1 });
  } catch (error) {
    // ✅ 添加错误处理和日志
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Failed to update card', details: error.message });
  }
});
```

## 修复内容

1. ✅ **添加 try-catch 错误处理**
   - 捕获 SQL 执行错误
   - 返回详细的错误信息给前端
   - 在控制台记录错误日志

2. ✅ **严格处理 undefined 值**
   - 使用 `|| null` 转换可选字段
   - 使用 `.map(val => val === undefined ? null : val)` 作为双重保险
   - 确保所有参数都是有效的 SQL 值

3. ✅ **一致性改进**
   - 与 POST 路由 (第 61-88 行) 保持一致
   - 都使用 `processedValues` 数组
   - 都有完善的错误处理

## 测试验证

### 测试步骤:
1. 选择一个或多个卡片
2. 选择目标分类(主菜单或子菜单)
3. 点击"移动"按钮
4. 观察是否成功移动

### 预期结果:
- ✅ 批量移动成功
- ✅ 显示 "成功移动 N 张卡片"
- ✅ 卡片出现在目标分类中
- ✅ 不再出现 500 错误

## 影响范围

此修复影响以下功能:
- ✅ 批量移动卡片
- ✅ 单个卡片移动 (使用下拉菜单)
- ✅ 卡片编辑更新

## 部署说明

1. **开发环境**:
   - 代码已修改: `api/routes/card.js`
   - 需要重启后端服务器: `npm run dev:api` 或双击 `start-api.bat`

2. **生产环境**:
   - 重新部署到 Vercel
   - 无需数据库迁移
   - 向后兼容

## 相关文件

- 修复文件: `api/routes/card.js` (第 90-116 行)
- 前端代码: `frontend/src/views/admin/CardManage.vue` (第 377-408 行)

## 修复日期

2025-10-22

## 测试状态

✅ 已测试
✅ 后端服务器已重启并应用修复
✅ API 端点正常响应

---

**注意**: 如果您仍然遇到此错误,请检查:
1. 后端服务器是否已重启
2. 浏览器是否已刷新 (Ctrl+F5 硬刷新)
3. 检查浏览器控制台是否有其他错误
