# 🚀 Nav Pro - Vercel 全栈导航系统

基于 Vue 3 + Express.js 的现代化导航网站，支持 Vercel 一键部署和数据持久化。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/truelife0958/nav-vercel)

---

## ✨ 核心特性

### 🎨 前端功能
- **现代化界面** - Vue 3 + 响应式设计
- **聚合搜索** - 支持 Google/百度/Bing/GitHub/站内搜索
- **动画效果** - 7种随机进场动画
- **友链展示** - 友情链接管理
- **广告系统** - 灵活的广告位配置

### 🔧 后端功能
- **数据持久化** - Vercel Postgres 数据库
- **身份认证** - JWT Token 认证
- **Serverless** - 无服务器架构
- **自动初始化** - 数据库自动创建和初始化
- **RESTful API** - 完整的 API 接口

### 🛠️ 管理后台
- 用户认证登录
- 菜单栏目管理（主菜单/子菜单）
- 导航卡片管理
- 友情链接管理
- 广告位管理

---

## 🎯 快速部署

### 一键部署到 Vercel（推荐）

1. **点击部署按钮**

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/truelife0958/nav-vercel)

2. **创建 Postgres 数据库**
   - 部署完成后，进入 Vercel Dashboard
   - 点击 **Storage** → **Create Database** → **Postgres**
   - 选择区域并创建
   - 点击 **Connect Project** 连接到项目

3. **配置环境变量**
   - 进入 **Settings** → **Environment Variables**
   - 添加以下变量：
     ```
     JWT_SECRET=your-super-secret-key-change-this
     ADMIN_USERNAME=admin
     ADMIN_PASSWORD=your-secure-password
     ```

4. **重新部署并访问**
   - 保存环境变量后，触发重新部署
   - 访问：`https://你的域名.vercel.app/`
   - 管理后台：`https://你的域名.vercel.app/admin`

---

## 🔧 本地开发

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装和启动

```bash
# 1. 克隆项目
git clone https://github.com/truelife0958/nav-vercel.git
cd nav-vercel

# 2. 安装依赖
npm install
cd frontend && npm install && cd ..

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接

# 4. 启动开发服务器
# 终端 1: 启动后端
cd api && node index.js

# 终端 2: 启动前端
cd frontend && npm run dev
```

---

## 📁 项目结构

```
nav-vercel/
├── frontend/              # Vue 3 前端应用
│   ├── src/
│   │   ├── components/   # 公共组件
│   │   ├── views/        # 页面视图
│   │   │   ├── Home.vue  # 首页
│   │   │   ├── Admin.vue # 管理后台
│   │   │   └── admin/    # 管理子页面
│   │   ├── api.js        # API 接口
│   │   └── router.js     # 路由配置
│   └── dist/             # 构建输出
│
├── api/                  # Express.js 后端
│   ├── index.js          # 主入口（Serverless Function）
│   ├── db.js             # Postgres 数据库
│   ├── config.js         # 配置文件
│   ├── validators.js     # 数据验证
│   └── middleware/       # 中间件（认证、日志、限流等）
│
├── vercel.json           # Vercel 部署配置
├── .vercelignore         # 部署忽略文件
└── README.md             # 本文档
```

---

## 🔐 环境变量

| 变量名 | 说明 | 必需 | 默认值 |
|--------|------|------|--------|
| `POSTGRES_URL` | Postgres 连接字符串 | ✅ | - |
| `JWT_SECRET` | JWT 加密密钥 | ✅ | - |
| `ADMIN_USERNAME` | 管理员用户名 | ⚪ | admin |
| `ADMIN_PASSWORD` | 管理员密码 | ⚪ | 123456 |
| `CORS_ORIGINS` | 允许的跨域源 | ⚪ | 自动配置 |

**安全提示**：生产环境必须修改默认密码和 JWT 密钥！

---

## 🌐 API 接口

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/menus` | 获取所有菜单 |
| GET | `/api/cards/:menuId` | 获取菜单卡片 |
| GET | `/api/friends` | 获取友情链接 |
| GET | `/api/ads` | 获取广告位 |
| POST | `/api/login` | 用户登录 |

### 需要认证的接口

所有管理操作（POST/PUT/DELETE）需要在请求头携带 JWT Token：

```javascript
Authorization: Bearer <your-token>
```

---

## 🗄️ 数据库

### Vercel Postgres（推荐）

- ✅ 数据永久保存
- ✅ 自动备份
- ✅ 免费额度：256MB 存储 + 60小时/月

### 内存数据库（降级方案）

未配置 Postgres 时自动使用内存数据库：
- ⚠️ 数据在重启后丢失
- ⚠️ 仅用于开发测试

---

## 🎨 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Vue Router** - 官方路由管理
- **Axios** - HTTP 客户端
- **Vite** - 下一代前端构建工具

### 后端
- **Express.js** - Node.js Web 框架
- **Vercel Serverless** - 无服务器函数
- **Vercel Postgres** - 托管数据库
- **JWT** - JSON Web Token 认证
- **bcrypt** - 密码加密

---

## 🐛 故障排除

### 数据库连接失败

**症状**：`Connection failed` 或 `timeout`

**解决方案**：
1. 确认已创建 Postgres 数据库
2. 确认数据库已连接到项目
3. 检查环境变量 `POSTGRES_URL`
4. 重新部署项目

### CORS 错误

**症状**：前端请求被阻止

**解决方案**：
- 检查 `api/index.js` 中的 CORS 配置
- 确保你的域名在 `allowedOrigins` 列表中

### 查看日志

在 Vercel Dashboard：
1. 进入项目
2. 点击 **Functions** 标签
3. 选择 `api/index.js`
4. 查看实时日志和错误信息

---

## 📝 开源协议

MIT License

---

## 👨‍💻 作者

**marry** - [GitHub](https://github.com/truelife0958)

---

## ⭐ 支持项目

如果这个项目对你有帮助，请给它一个 ⭐ Star！

---

**3 分钟即可完成部署！** 🚀
