-- 数据库迁移脚本：重命名保留关键字字段
-- 执行时间：2025-10-26
-- 作用：将旧的保留关键字字段名改为新字段名

-- 1. 修改 menus 表
ALTER TABLE menus RENAME COLUMN "order" TO sort_order;

-- 2. 修改 sub_menus 表
ALTER TABLE sub_menus RENAME COLUMN "order" TO sort_order;

-- 3. 修改 cards 表
ALTER TABLE cards RENAME COLUMN "desc" TO description;
ALTER TABLE cards RENAME COLUMN "order" TO sort_order;

-- 验证迁移结果
SELECT 'menus table columns:' as info;
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'menus'
ORDER BY ordinal_position;

SELECT 'sub_menus table columns:' as info;
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'sub_menus'
ORDER BY ordinal_position;

SELECT 'cards table columns:' as info;
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'cards'
ORDER BY ordinal_position;
