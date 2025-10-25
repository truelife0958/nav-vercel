# 🚀 Nav Pro - Vercel 版本

基于 nav-pro 优化的 Vercel 全栈导航系统，支持一键部署和数据持久化。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/truelife0958/nav-vercel)

---

## ✨ 特性

### 前端特性
- 🎨 现代化 Vue 3 界面
- 📱 完美响应式设计
- 🔍 聚合搜索（Google/百度/Bing/GitHub/站内）
- 🎭 7种随机进场动画
- 🔗 友情链接展示
- 📢 广告位支持

### 后端特性
- 💾 **Vercel Postgres** - 真正的数据持久化
- 🔒 JWT 身份认证
- 🚀 Serverless 架构
- 🔄 自动数据库初始化
- 📊 完整的 RESTful API

### 管理功能
- 👤 用户认证登录
- 📋 栏目管理（主菜单/子菜单）
- 🃏 导航卡片管理
- 🔗 友情链接管理
- 📢 广告位管理

---

## 🎯 快速部署

### 方式一：一键部署到 Vercel（推荐）

1. **点击部署按钮**
   
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/truelife0958/nav-vercel)

2. **设置 Postgres 数据库**
   - 部署完成后，进入 Vercel Dashboard
   - 点击 **Storage** → **Create Database** → **Postgres**
   - 选择区域，点击 **Create**
   - 点击 **Connect Project** 连接到你的项目

3. **配置环境变量**
   - 进入 **Settings** → **Environment Variables**
   - 添加以下变量：
     ```
     JWT_SECRET=your-super-secret-key-123456
     ADMIN_USERNAME=admin
     ADMIN_PASSWORD=your-secure-password
     ```
   - 保存后重新部署

4. **访问网站**
   - 首页：`https://你的域名.vercel.app/`
   - 管理后台：`https://你的域名.vercel.app/admin`

### 方式二：通过 GitHub

```bash
# 1. Fork 或 Clone 项目
git clone https://github.com/truelife0958/nav-vercel.git
cd nav-vercel

# 2. 推送到你的 GitHub 仓库
git remote set-url origin https://github.com/你的用户名/nav-vercel.git
git push -u origin main

# 3. 在 Vercel 导入 GitHub 仓库
# 访问 https://vercel.com/new
# 选择你的仓库并导入

# 4. 按照"方式一"的步骤 2-4 设置数据库和环境变量
```

---

## 🔧 本地开发

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
# 安装后端依赖
cd api
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 启动开发服务器

```bash
# 终端 1: 启动后端 API
cd api
node index.js
# 运行在 http://localhost:3001

# 终端 2: 启动前端
cd frontend
npm run dev
# 运行在 http://localhost:3002
```

### 使用 Vercel Dev（推荐）

```bash
# 安装 Vercel CLI
npm install -g vercel

# 在项目根目录运行
vercel dev
# 自动启动前后端，访问 http://localhost:3000
```

---

## 📁 项目结构

```
nav-vercel/
├── frontend/              # Vue 3 前端应用
│   ├── src/
│   │   ├── components/   # Vue 组件
│   │   ├── views/        # 页面视图
│   │   ├── api.js        # API 接口封装
│   │   └── router.js     # 路由配置
│   └── package.json
│
├── api/                  # Serverless Functions
│   ├── index.js          # API 主入口
│   ├── db.js             # 数据库连接层
│   ├── memoryDb.js       # 内存数据库（降级方案）
│   ├── config.js         # 配置文件
│   ├── routes/           # API 路由
│   │   ├── menu.js       # 菜单管理
│   │   ├── card.js       # 卡片管理
│   │   ├── auth.js       # 用户认证
│   │   ├── ad.js         # 广告管理
│   │   ├── friend.js     # 友链管理
│   │   └── user.js       # 用户管理
│   └── package.json
│
├── vercel.json           # Vercel 配置
├── .vercelignore         # Vercel 忽略文件
└── README.md            # 本文档
```

---

## 🔐 环境变量配置

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `POSTGRES_URL` | Postgres 连接字符串 | ✅ 必需（Vercel 自动添加） |
| `JWT_SECRET` | JWT 加密密钥 | ✅ 必需 |
| `ADMIN_USERNAME` | 管理员用户名 | ⚪ 可选（默认: admin） |
| `ADMIN_PASSWORD` | 管理员密码 | ⚪ 可选（默认: 123456） |

---

## 🗄️ 数据库说明

### Vercel Postgres

项目使用 Vercel Postgres 作为主数据库：

- ✅ 数据永久保存
- ✅ 自动备份
- ✅ 支持并发访问
- ✅ 免费额度：256MB 存储 + 60小时计算时间/月

### 降级方案

如果未配置 Postgres，系统会自动使用内存数据库：

- ⚠️ 数据在重启后丢失
- ⚠️ 仅用于开发和测试
- ⚠️ 不推荐生产环境使用

---

## 🌐 API 端点

### 公开端点（无需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/menus` | 获取所有菜单 |
| GET | `/api/cards/:menuId` | 获取指定菜单的卡片 |
| GET | `/api/friends` | 获取友情链接 |
| GET | `/api/ads` | 获取广告位 |
| POST | `/api/login` | 用户登录 |

### 需要认证的端点

所有 POST/PUT/DELETE 操作都需要在请求头携带 JWT Token：

```javascript
Authorization: Bearer <your-token>
```

---

## 🎨 自定义配置

### 修改 API 地址

**开发环境** (`frontend/.env.development`):
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

**生产环境**：自动使用相对路径 `/api`

### 修改前端主题

编辑 `frontend/src/views/Home.vue`：

```vue
<!-- 修改背景渐变色 -->
<div class="bg-gradient-to-br from-[#0a0e27] to-[#1e293b]">

<!-- 修改卡片动画 -->
const animations = ['slideUp', 'radial', 'fadeIn', ...]
```

---

## 🐛 故障排除

### 数据库连接失败

**错误**：`Connection failed` 或 `timeout`

**解决**：
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

### API 请求 CORS 错误

检查 `api/index.js` 的 CORS 配置，确保包含你的域名。

---

## 📊 技术栈

### 前端
- Vue 3
- Vue Router
- Axios
- Vite

### 后端
- Express.js
- Vercel Serverless Functions
- Vercel Postgres
- JWT + bcrypt

---

## 📝 开源协议

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 👨‍💻 作者

**marry** - [GitHub](https://github.com/truelife0958)

基于 [nav-pro-master](https://github.com/truelife0958/nav-pro) 优化

---

## ⭐ Star History

如果这个项目对你有帮助，请给它一个 ⭐ Star！

---

## 🎉 快速开始

```bash
# 1. Clone 项目
git clone https://github.com/truelife0958/nav-vercel.git

# 2. 一键部署到 Vercel
vercel --prod

# 3. 设置 Postgres 数据库

# 4. 访问你的网站！
```

**3 分钟即可完成部署！** 🚀
