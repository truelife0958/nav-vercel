# 🔧 数据库迁移指南

## 问题说明

数据库中存在旧的表结构，使用了PostgreSQL保留关键字作为列名：
- `"order"` → 需要改为 `sort_order`
- `"desc"` → 需要改为 `description`

## 迁移步骤

### 方法1：使用 Neon Console（推荐）

1. 访问 [Neon Console](https://console.neon.tech/)
2. 登录你的账户
3. 选择你的项目
4. 点击 "SQL Editor"
5. 复制并执行 `migrate-database.sql` 文件中的SQL命令

### 方法2：使用 psql 命令行

```bash
# 使用你的 POSTGRES_URL 连接数据库
psql $POSTGRES_URL < migrate-database.sql
```

### 方法3：使用 Node.js 脚本（自动化）

老王已经为你准备了自动迁移脚本，执行：

```bash
node migrate-db.js
```

## 迁移内容

### menus 表
```sql
ALTER TABLE menus RENAME COLUMN "order" TO sort_order;
```

### sub_menus 表
```sql
ALTER TABLE sub_menus RENAME COLUMN "order" TO sort_order;
```

### cards 表
```sql
ALTER TABLE cards RENAME COLUMN "desc" TO description;
ALTER TABLE cards RENAME COLUMN "order" TO sort_order;
```

## 验证迁移

执行迁移后，访问健康检查接口验证：
```
https://nav-vercel-eight.vercel.app/api/health
```

然后访问菜单接口：
```
https://nav-vercel-eight.vercel.app/api/menus
```

如果没有报错，说明迁移成功！

## 回滚（如果出问题）

```sql
-- 回滚到旧字段名
ALTER TABLE menus RENAME COLUMN sort_order TO "order";
ALTER TABLE sub_menus RENAME COLUMN sort_order TO "order";
ALTER TABLE cards RENAME COLUMN description TO "desc";
ALTER TABLE cards RENAME COLUMN sort_order TO "order";
```

## 注意事项

⚠️ **重要**：
- 迁移过程中可能会有短暂的服务中断
- 建议在低峰时段执行
- 执行前建议备份数据库
- 迁移是不可逆的（除非手动回滚）

## 常见问题

### Q: 迁移失败怎么办？
A: 检查错误信息，可能需要先删除表重新创建，或者使用回滚脚本

### Q: 可以不迁移吗？
A: 不可以，新代码已经使用新字段名，必须迁移才能正常使用

### Q: 会丢失数据吗？
A: 不会，`ALTER TABLE RENAME COLUMN` 只是改列名，数据不会丢失
