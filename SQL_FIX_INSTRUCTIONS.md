# 🔧 SQL 语法错误修复说明

## 🎯 问题

Postgres 连接成功，但数据库初始化失败：

```
syntax error at or near "desc"
```

## ✅ 已修复

在 `api/db.js` 第 138 行，`desc` 是 PostgreSQL 保留关键字，需要用引号包裹。

### 修复前：
```javascript
desc TEXT,
```

### 修复后：
```javascript
"desc" TEXT,
```

## 📤 部署方式

### 方式 1：Git 推送（推荐）

等网络恢复后执行：

```bash
git push origin main
```

Vercel 会自动部署。

### 方式 2：Vercel Dashboard 手动修复（备用）

如果无法推送 Git，可以直接在 Vercel 修改：

1. 访问 Vercel Dashboard
2. 进入项目 `nav-vercel`
3. 点击 "Source" 标签
4. 找到 `api/db.js` 文件
5. 找到第 138 行
6. 修改 `desc TEXT,` 为 `"desc" TEXT,`
7. 保存并部署

### 方式 3：本地修改文件并上传

1. 打开 `api/db.js`
2. 找到第 138 行
3. 修改为：`"desc" TEXT,`
4. 保存文件
5. 通过 Vercel CLI 或 Dashboard 部署

## 🎉 修复后

数据库将成功初始化，所有表结构创建完成！

然后可以：
- ✅ 正常使用 Postgres 数据库
- ✅ 数据持久化保存
- ✅ 不会在重启后丢失数据

## 🔍 验证

修复后运行：

```powershell
# 检查健康状态
Invoke-RestMethod -Uri 'https://nav-vercel-eight.vercel.app/api/health'

# 登录并添加测试数据
.\test-login.ps1
.\test-add-menu.ps1
.\test-add-card.ps1

# 验证数据存在
Invoke-RestMethod -Uri 'https://nav-vercel-eight.vercel.app/api/menus'
```

如果看到菜单数据，说明修复成功！🎊