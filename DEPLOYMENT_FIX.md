# 🔧 部署修复说明

## 📊 当前状态

### ✅ 已完成
- [x] 完整的 Vercel Postgres 迁移
- [x] 所有 API 路由重构
- [x] 错误处理和降级方案
- [x] Serverless Functions 限制修复

### ⏳ 待推送
本地有 1 个提交待推送：
```
efc076e - fix: 使用 includeFiles 包含依赖文件，同时限制只创建一个 Function
```

---

## 🚀 手动推送步骤

由于网络连接问题，请手动执行以下操作之一：

### 方式 1：使用 GitHub Desktop（推荐）
1. 打开 GitHub Desktop
2. 选择 `nav-vercel` 仓库
3. 点击 **Push origin** 按钮

### 方式 2：命令行重试
```bash
git push origin main
```

### 方式 3：使用代理
```bash
# 设置代理（修改端口为你的代理端口）
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 推送
git push origin main

# 推送完成后取消代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```

---

## 🎯 本次修复内容

### 问题
1. **Serverless Functions 超过 12 个限制** - Vercel Hobby 计划限制
2. **模块找不到错误** - `.vercelignore` 配置问题

### 解决方案

#### 1. `vercel.json` 配置
```json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 10,
      "memory": 1024,
      "includeFiles": "api/**"
    }
  }
}
```

**说明**：
- 只为 `api/index.js` 创建 Serverless Function
- 使用 `includeFiles` 包含所有 `api/**` 文件作为依赖
- 这样只创建 1 个 Function，不会超过限制

#### 2. `.vercelignore` 配置
```
# 只排除真正不需要的文件
api/tests/**
api/database/**
*.log
*.tmp
```

**说明**：
- 不排除 `api/routes/`、`api/config.js`、`api/db.js` 等
- 这些文件会被 `includeFiles` 包含，作为依赖
- 但不会为它们创建独立的 Functions

---

## 🎉 预期结果

推送并部署成功后：

### 1. Serverless Functions 数量
- ✅ 只有 1 个 Function: `api/index.js`
- ✅ 不会超过 12 个限制

### 2. 模块可以找到
- ✅ `api/routes/menu.js` 等文件被正确包含
- ✅ 不会出现 "Cannot find module" 错误

### 3. API 正常工作
```
✅ GET /api/health
✅ GET /api/menus
✅ GET /api/cards/:menuId
✅ POST /api/login
```

---

## 📋 验证清单

推送并部署完成后（约 1-2 分钟），请验证：

### 1. 检查 Functions 数量
在 Vercel Dashboard → Functions 标签：
- [ ] 只有 1 个 Function: `api/index.js`
- [ ] 没有超过限制的错误

### 2. 健康检查
```bash
curl https://nav-vercel-jade.vercel.app/api/health
```
预期返回：
```json
{
  "status": "ok",
  "database": "initialized"
}
```

### 3. 测试菜单 API
```bash
curl https://nav-vercel-jade.vercel.app/api/menus
```
预期：返回菜单数组（可能为空 `[]`），不应该是 500 错误

### 4. 访问网站
- [ ] 首页：https://nav-vercel-jade.vercel.app/
- [ ] 管理后台：https://nav-vercel-jade.vercel.app/admin

---

## 🐛 如果还有问题

### 情况 A：仍然超过 12 个 Functions
**可能原因**：`vercel.json` 配置未生效

**解决方案**：
1. 检查 Vercel Dashboard → Settings → General
2. 查看 Framework Preset 是否正确
3. 手动删除旧的 Functions

### 情况 B：仍然找不到模块
**可能原因**：`includeFiles` 路径不正确

**解决方案**：
1. 查看 Vercel Functions 日志
2. 确认哪些文件被包含了
3. 可能需要使用绝对路径

### 情况 C：数据库连接失败
**原因**：Postgres 环境变量未设置

**解决方案**：
1. Vercel Dashboard → Storage → Create Database → Postgres
2. Connect Project 连接数据库
3. 添加 `JWT_SECRET` 等环境变量
4. 重新部署

---

## 💡 技术架构

```
部署架构：
┌─────────────────────────────────────┐
│  Frontend (Static Files)            │
│  - HTML, CSS, JS                    │
│  - 部署到 Vercel CDN                │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  Serverless Function (1 个)         │
│  ┌───────────────────────────────┐  │
│  │  api/index.js (主入口)        │  │
│  │    ├─ require('./routes/menu')│  │
│  │    ├─ require('./routes/card')│  │
│  │    ├─ require('./db')         │  │
│  │    └─ require('./config')     │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  Vercel Postgres                    │
│  - menus, sub_menus, cards         │
│  - users, ads, friends             │
└─────────────────────────────────────┘
```

---

## 🎊 完成！

推送成功后，项目将拥有：
- ✅ 真正的数据持久化（Vercel Postgres）
- ✅ 只有 1 个 Serverless Function（不超限制）
- ✅ 所有依赖文件正确包含（不会找不到模块）
- ✅ 完整的 API 功能
- ✅ 响应式 Vue 3 前端

**请推送代码并等待部署完成！** 🚀