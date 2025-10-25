# 🚀 Nav Pro - Vercel 一键部署指南

**基于 nav-pro-master 项目优化的 Vercel 全栈部署版本**

---

## 📋 项目概述

这是一个经过优化的 Nav Pro 导航系统，专门为 Vercel 平台设计的一键部署版本。

### 核心特性

- ✅ **前端**: Vue 3 + Vite 6.0 - 现代化 SPA 应用
- ✅ **后端**: Express + SQLite - Vercel Serverless Functions
- ✅ **数据库**: SQLite (自动初始化，无需额外配置)
- ✅ **认证**: JWT Token 认证系统
- ✅ **部署**: 一键部署到 Vercel，零配置

### 功能特性

**前台功能**:
- 🏠 美观的卡片式导航界面
- 🔍 聚合搜索 (Google/百度/Bing/GitHub/站内)
- 📱 完美的响应式设计
- 🎨 7种随机进场动画
- 🔗 友情链接展示
- 📢 广告位支持

**后台管理**:
- 👤 用户认证登录
- 📋 栏目管理 (主菜单/子菜单)
- 🃏 导航卡片管理
- 🔗 友情链接管理
- 📢 广告位管理
- 📊 数据统计

---

## 🎯 一键部署到 Vercel

### 方式一: 通过 GitHub (推荐)

#### 步骤 1: 准备 GitHub 仓库

```bash
# 1. 进入项目目录
cd D:\ebak\project\nave\nav-vercel

# 2. 初始化 Git (如果还没有)
git init

# 3. 添加所有文件
git add .

# 4. 创建首次提交
git commit -m "Initial commit: Nav Pro Vercel"

# 5. 连接到你的 GitHub 仓库
git remote add origin https://github.com/你的用户名/nav-pro-vercel.git

# 6. 推送到 GitHub
git push -u origin main
```

#### 步骤 2: 在 Vercel 部署

1. **访问 Vercel**: https://vercel.com
2. **登录/注册**: 使用 GitHub 账号登录
3. **导入项目**:
   - 点击 "Add New..." → "Project"
   - 选择你的 GitHub 仓库 `nav-pro-vercel`
   - 点击 "Import"

4. **配置项目** (保持默认即可):
   - Framework Preset: `Vite`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `frontend/dist`

5. **配置环境变量** (可选):
   ```
   JWT_SECRET=你的超级密钥-请更换为复杂字符串
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=你的管理员密码
   ```

6. **点击 Deploy**: 等待 1-2 分钟部署完成

7. **访问你的网站**:
   - Vercel 会自动生成域名，如 `https://nav-pro-vercel.vercel.app`

---

### 方式二: 通过 Vercel CLI

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 进入项目目录
cd D:\ebak\project\nave\nav-vercel

# 3. 登录 Vercel
vercel login

# 4. 部署项目
vercel

# 5. 跟随提示操作:
# - Set up and deploy? [Y/n] → Y
# - Which scope? → 选择你的账号
# - Link to existing project? [y/N] → N
# - What's your project's name? → nav-pro-vercel
# - In which directory is your code located? → ./
# - Want to override the settings? [y/N] → N

# 6. 部署到生产环境
vercel --prod
```

---

## 🔧 本地开发

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
# 进入项目目录
cd nav-vercel

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../api
npm install

# 返回根目录
cd ..
```

### 启动开发服务器

#### 方式一: 分别启动前后端

```bash
# 终端 1: 启动后端 API
cd api
node index.js
# 后端运行在 http://localhost:3000

# 终端 2: 启动前端
cd frontend
npm run dev
# 前端运行在 http://localhost:5173
```

#### 方式二: 使用 Vercel Dev (推荐)

```bash
# 安装 Vercel CLI
npm install -g vercel

# 在项目根目录运行
vercel dev

# 自动启动前后端，访问 http://localhost:3000
```
|
### 运行测试
|
```bash
# 进入后端目录
cd api
|
# 运行单元测试
npm test
```

### 访问应用

- **首页**: http://localhost:5173
- **管理后台**: http://localhost:5173/admin
- **API 文档**: http://localhost:3000/api/health

### 默认管理员账号

```
用户名: admin
密码: 123456
```

⚠️ **重要**: 生产环境请务必修改默认密码！

---

## 📁 项目结构

```
nav-vercel/
├── frontend/               # 前端 Vue 3 应用
│   ├── src/               # 源代码
│   │   ├── components/    # Vue 组件
│   │   ├── views/         # 页面视图
│   │   ├── api.js         # API 接口
│   │   ├── router.js      # 路由配置
│   │   ├── App.vue        # 根组件
│   │   └── main.js        # 入口文件
│   ├── public/            # 静态资源
│   ├── index.html         # HTML 模板
│   ├── package.json       # 前端依赖
│   ├── vite.config.mjs    # Vite 配置
│   └── .env.example       # 环境变量示例
│
├── api/                   # 后端 Serverless Functions
│   ├── index.js           # API 主入口 (Vercel Function)
│   ├── tests/             # 后端测试
│   └── package.json       # 后端依赖
│
├── vercel.json            # Vercel 部署配置
├── package.json           # 根项目配置
├── .gitignore             # Git 忽略文件
├── .env.example           # 环境变量示例
└── README.md              # 本文档
```

---

## 🔒 环境变量配置

### 必需的环境变量

在 Vercel 项目设置中添加以下环境变量:

| 变量名 | 说明 | 默认值 | 是否必需 |
|--------|------|--------|---------|
| `JWT_SECRET` | JWT 加密密钥 | `your-secret-key` | ✅ 必需 |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` | ⚠️ 建议修改 |
| `ADMIN_PASSWORD` | 管理员密码 | `123456` | ⚠️ 建议修改 |
| `NODE_ENV` | 运行环境 | `production` | ⚪ 可选 |

### 如何在 Vercel 设置环境变量

1. 进入你的 Vercel 项目
2. 点击 "Settings" → "Environment Variables"
3. 添加上述环境变量
4. 点击 "Save"
5. 重新部署项目 (Deployments → Redeploy)

---

## 🗄️ 数据库说明

### SQLite 自动初始化

项目使用 SQLite 数据库，部署时会自动:

1. ✅ 在 `/tmp/nav.db` 创建数据库 (Vercel 环境)
2. ✅ 自动创建所有必需的表结构
3. ✅ 插入默认管理员账号
4. ✅ 无需手动配置

### 数据库表结构

- `menus` - 主菜单表
- `sub_menus` - 子菜单表
- `cards` - 导航卡片表
- `friends` - 友情链接表
- `ads` - 广告位表
- `users` - 用户表

### ⚠️ 重要提示

**Vercel 限制**: `/tmp` 目录在 Serverless Function 重启后会被清空，数据会丢失。

**生产环境建议**:
- 使用外部数据库 (如 PlanetScale MySQL, Supabase PostgreSQL)
- 或使用 Vercel KV (Redis) 存储关键数据
- 定期备份数据库

**开发/测试环境**:
- 项目默认使用 SQLite 进行本地开发和测试。
- 数据库文件位于 `api/database/nav.db`。
- **请勿在生产环境中使用此 SQLite 数据库。**

---

## 🌐 API 端点

### 公开端点

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/health` | 健康检查 |
| `GET` | `/api/menus` | 获取所有菜单 |
| `GET` | `/api/cards` | 获取所有卡片 (需要认证) |
| `GET` | `/api/friends` | 获取友情链接 |
| `GET` | `/api/ads` | 获取广告位 |
| `POST` | `/api/login` | 用户登录 |

### 需要认证的端点

所有管理操作 (POST/PUT/DELETE) 都需要在请求头中携带 JWT Token:

```javascript
Authorization: Bearer <你的token>
```

---

## 🎨 自定义配置

### 修改 API 地址

**开发环境** (frontend/.env.development):
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**生产环境** (Vercel 自动配置):
```env
VITE_API_BASE_URL=/api
```

### 修改前端主题

编辑 `frontend/src/views/Home.vue`:

```vue
<!-- 修改背景渐变色 -->
<div class="bg-gradient-to-br from-[#0a0e27] to-[#1e293b]">

<!-- 修改卡片动画 -->
const animations = ['slideUp', 'radial', 'fadeIn', ...]
```

### 添加自定义路由

编辑 `frontend/src/router.js`:

```javascript
{
  path: '/custom',
  component: () => import('./views/Custom.vue')
}
```

---

## 🚀 性能优化

### 前端优化

- ✅ Vite 按需加载
- ✅ 路由懒加载
- ✅ 图片压缩优化
- ✅ CSS/JS 自动压缩

### 后端优化

- ✅ Serverless 按需执行
- ✅ 自动扩展
- ✅ 全球 CDN 加速
- ✅ CORS 优化

### Vercel 优势

- ⚡ 全球 Edge Network
- ⚡ 自动 HTTPS
- ⚡ 自动构建部署
- ⚡ 零配置 CDN

---

## 🔧 常见问题

### Q1: 部署后数据丢失怎么办?

**A**: Vercel `/tmp` 目录会定期清空。生产环境建议:
- 使用外部数据库 (PlanetScale, Supabase)
- 添加数据持久化方案
- 定期备份数据

### Q2: 如何修改管理员密码?

**A**: 两种方式:
1. **通过环境变量**: 在 Vercel 设置 `ADMIN_PASSWORD`
2. **登录后台修改**: /admin → 用户管理 → 修改密码

### Q3: API 请求 CORS 错误?

**A**: 检查 `api/index.js` 的 CORS 配置:
```javascript
app.use(cors({
  origin: '*',  // 生产环境建议设置具体域名
  credentials: true
}));
```

### Q4: 构建失败怎么办?

**A**: 常见原因:
1. 检查 Node.js 版本 (>=18)
2. 检查依赖是否完整 (`npm install`)
3. 查看 Vercel 构建日志
4. 检查 `vercel.json` 配置

### Q5: 如何添加自定义域名?

**A**:
1. Vercel 项目 → Settings → Domains
2. 添加你的域名
3. 按提示配置 DNS (CNAME 或 A 记录)
4. 等待 DNS 生效 (几分钟到几小时)

---

## 📊 监控与日志

### Vercel 内置监控

- **访问**: Project → Analytics
- **查看**:
  - 页面访问量
  - 响应时间
  - 地理分布
  - 设备统计

### 查看日志

- **实时日志**: Project → Deployments → Functions
- **错误追踪**: 自动捕获运行时错误

---

## 🛠️ 开发技巧

### 热更新调试

```bash
# 前端热更新
cd frontend && npm run dev

# 后端修改后需要重启
cd api && node index.js
```

### 本地测试 Vercel 环境

```bash
# 安装 Vercel CLI
npm install -g vercel

# 本地运行 Vercel Dev
vercel dev

# 完全模拟 Vercel 生产环境
```

### 预览部署

```bash
# 部署预览版本 (不影响生产)
vercel

# 查看预览 URL
# https://nav-pro-vercel-xxx.vercel.app
```

---

## 📖 相关文档

- **Vercel 官方文档**: https://vercel.com/docs
- **Vue 3 文档**: https://vuejs.org
- **Vite 文档**: https://vitejs.dev
- **Express 文档**: https://expressjs.com

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 开源协议

本项目采用 **MIT** 协议 - 查看 [LICENSE](LICENSE) 文件了解详情

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
git clone https://github.com/你的用户名/nav-pro-vercel.git

# 2. 安装依赖
cd nav-pro-vercel/frontend && npm install
cd ../api && npm install

# 3. 本地开发
vercel dev

# 4. 部署到 Vercel
vercel --prod
```

**3 分钟即可完成部署！** 🚀

---

## 📞 联系方式

- **Issues**: https://github.com/你的用户名/nav-pro-vercel/issues
- **Email**: your-email@example.com

---

**享受你的导航系统吧！** ✨
