# Vercel Postgres 设置指南

## 📦 项目已完成重构

本项目已从 SQLite 迁移到 **Vercel Postgres**，实现真正的数据持久化。

## 🔧 Vercel Postgres 设置步骤

### 1. 在 Vercel Dashboard 中创建 Postgres 数据库

1. 访问你的 Vercel 项目：https://vercel.com/dashboard
2. 进入你的项目 `nav-vercel`
3. 点击顶部导航栏的 **Storage** 标签
4. 点击 **Create Database**
5. 选择 **Postgres**
6. 选择区域（推荐选择离你最近的区域）
7. 点击 **Create**

### 2. 连接数据库到项目

1. 创建数据库后，Vercel 会自动显示连接信息
2. 点击 **Connect Project** 按钮
3. 选择你的项目 `nav-vercel`
4. 点击 **Connect**

Vercel 会自动添加以下环境变量到你的项目：
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 3. 重新部署项目

连接数据库后，Vercel 会自动触发重新部署，或者你可以手动触发：

1. 进入 **Deployments** 标签
2. 点击最新部署右侧的三个点
3. 选择 **Redeploy**

### 4. 验证数据库连接

部署完成后：

1. 访问健康检查端点：`https://你的域名/api/health`
2. 检查返回的 JSON 中 `database` 字段是否为 `initialized`

## 🎯 数据库特性

### 自动初始化

项目会在首次请求时自动：
- ✅ 创建所有必需的表
- ✅ 创建默认管理员账户
- ✅ 设置外键关系

### 数据持久化

- ✅ 数据永久保存在 Vercel Postgres
- ✅ 不会因为 Serverless Function 重启而丢失
- ✅ 支持并发访问

### 免费额度

Vercel Postgres 免费计划包含：
- 💾 256 MB 存储空间
- 📊 60 小时计算时间/月
- 🔄 10,000 行读取/月

对于个人导航网站完全够用！

## 🔐 环境变量

确保在 Vercel 项目设置中配置以下环境变量：

```env
# Vercel Postgres（自动添加）
POSTGRES_URL=postgres://...

# 应用配置（需要手动添加）
JWT_SECRET=your-super-secret-key-change-this
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

### 设置环境变量：

1. 进入 Vercel 项目
2. 点击 **Settings** → **Environment Variables**
3. 添加 `JWT_SECRET`、`ADMIN_USERNAME`、`ADMIN_PASSWORD`
4. 保存后重新部署

## 📝 数据库表结构

项目自动创建以下表：

- `menus` - 主菜单
- `sub_menus` - 子菜单
- `cards` - 导航卡片
- `users` - 用户账户
- `ads` - 广告位
- `friends` - 友情链接

## 🐛 故障排除

### 数据库连接失败

如果看到 "数据库初始化失败" 错误：

1. 确认 Postgres 数据库已创建
2. 确认数据库已连接到项目
3. 检查环境变量 `POSTGRES_URL` 是否存在
4. 重新部署项目

### 查看日志

在 Vercel Dashboard：
1. 进入项目
2. 点击 **Functions** 标签
3. 选择 `api/index.js`
4. 查看实时日志

## ✅ 完成

设置完成后，你的导航网站将拥有：
- 💾 永久数据存储
- 🚀 快速响应
- 🔒 安全可靠
- 📈 易于扩展

享受你的导航系统吧！🎉