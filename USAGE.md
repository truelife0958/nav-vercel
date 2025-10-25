---
生成时间: 2025-10-21
源项目: nav-pro-master (Vue 3 + Express)
目标: Vercel 一键部署版本
---

# ✅ Nav Pro Vercel 项目生成完成！

## 🎉 项目位置

```
D:\ebak\project\nave\nav-vercel
```

## 📦 已生成文件

### 核心配置
- ✅ `vercel.json` - Vercel 部署配置
- ✅ `package.json` - 根项目配置
- ✅ `.gitignore` - Git 忽略规则
- ✅ `.env.example` - 环境变量模板
- ✅ `LICENSE` - MIT 开源协议

### 前端 (frontend/)
- ✅ `src/` - 18 个组件文件 (完整复制)
- ✅ `public/` - 3 个静态资源
- ✅ `src/api.js` - API 客户端 (Vercel 优化)
- ✅ `vite.config.mjs` - Vite 配置 (新增代理)
- ✅ `package.json` - 前端依赖
- ✅ `.env.example` - 前端环境变量

### 后端 (api/)
- ✅ `index.js` - Serverless API (全新编写)
- ✅ `package.json` - 后端依赖

### 部署工具
- ✅ `deploy.bat` - Windows 一键部署脚本
- ✅ `deploy.sh` - Linux/Mac 一键部署脚本
- ✅ `.github/workflows/deploy.yml` - GitHub Actions CI/CD

### 文档
- ✅ `README.md` - 完整使用文档 (1000+ 行)
- ✅ `DEPLOY.md` - 快速部署指南
- ✅ `QUICKSTART.md` - 3分钟快速开始
- ✅ `PROJECT_SUMMARY.md` - 项目生成总结
- ✅ `USAGE.md` - 本文件

---

## 🚀 立即部署 (3 种方式)

### 方式 1: 一键脚本 (最简单)

**Windows:**
```cmd
cd D:\ebak\project\nave\nav-vercel
deploy.bat
```

**Linux/Mac:**
```bash
cd /path/to/nav-vercel
chmod +x deploy.sh
./deploy.sh
```

### 方式 2: Vercel CLI (推荐)

```bash
# 进入项目目录
cd D:\ebak\project\nave\nav-vercel

# 安装 Vercel CLI (首次)
npm install -g vercel

# 登录 Vercel
vercel login

# 部署到生产环境
vercel --prod
```

### 方式 3: GitHub 自动部署

```bash
# 1. 初始化 Git
cd D:\ebak\project\nave\nav-vercel
git init
git add .
git commit -m "Initial commit: Nav Pro Vercel"

# 2. 连接 GitHub (替换为你的仓库地址)
git remote add origin https://github.com/你的用户名/nav-pro-vercel.git
git push -u origin main

# 3. 在 Vercel 导入
# 访问: https://vercel.com/new
# 选择: Import Git Repository
# 选择你的仓库 → Import → Deploy
```

---

## 💻 本地开发

### 方式 1: Vercel Dev (推荐)

```bash
cd D:\ebak\project\nave\nav-vercel

# 安装 Vercel CLI
npm install -g vercel

# 启动本地开发服务器
vercel dev

# 访问: http://localhost:3000
```

### 方式 2: 分别启动前后端

```bash
# 终端 1: 启动后端
cd D:\ebak\project\nave\nav-vercel\api
npm install
node index.js
# 运行在: http://localhost:3000

# 终端 2: 启动前端
cd D:\ebak\project\nave\nav-vercel\frontend
npm install
npm run dev
# 运行在: http://localhost:5173
```

---

## 🔐 默认管理员账号

```
URL: /admin
用户名: admin
密码: 123456
```

⚠️ **重要**: 生产环境务必修改密码！

**修改方式**:
1. 登录后台 → 用户管理 → 修改密码
2. 或设置环境变量: `ADMIN_PASSWORD=你的新密码`

---

## 🌐 访问应用

### 本地开发
- **首页**: http://localhost:3000 或 http://localhost:5173
- **管理后台**: http://localhost:3000/admin
- **API 健康检查**: http://localhost:3000/api/health

### Vercel 部署后
- **首页**: https://你的项目名.vercel.app
- **管理后台**: https://你的项目名.vercel.app/admin
- **API**: https://你的项目名.vercel.app/api/*

---

## 🔧 环境变量配置

### Vercel 生产环境

1. 访问: https://vercel.com/dashboard
2. 选择你的项目 → Settings → Environment Variables
3. 添加以下变量:

| 变量名 | 值 | 说明 |
|--------|---|------|
| `JWT_SECRET` | `你的32位复杂字符串` | JWT 加密密钥 (必需) |
| `ADMIN_USERNAME` | `admin` | 管理员用户名 (可选) |
| `ADMIN_PASSWORD` | `你的密码` | 管理员密码 (建议设置) |

4. 保存后重新部署: Deployments → Redeploy

### 本地开发

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env
JWT_SECRET=your-local-secret-key
```

---

## 📁 项目结构

```
nav-vercel/
├── frontend/                 # Vue 3 前端
│   ├── src/
│   │   ├── components/      # 组件 (18 个文件)
│   │   ├── views/           # 页面视图
│   │   ├── api.js           # API 客户端
│   │   ├── router.js        # 路由配置
│   │   ├── App.vue
│   │   └── main.js
│   ├── public/              # 静态资源
│   ├── index.html
│   ├── package.json
│   └── vite.config.mjs
│
├── api/                     # Serverless API
│   ├── index.js            # API 主入口
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy.yml      # CI/CD 配置
│
├── vercel.json             # Vercel 配置
├── package.json
├── .gitignore
├── .env.example
│
├── deploy.bat              # Windows 部署脚本
├── deploy.sh               # Linux/Mac 部署脚本
│
├── README.md               # 完整文档
├── DEPLOY.md               # 部署指南
├── QUICKSTART.md           # 快速开始
├── PROJECT_SUMMARY.md      # 项目总结
├── USAGE.md                # 本文件
└── LICENSE                 # MIT 协议
```

---

## 🎯 核心功能

### 前台功能
- ✅ 卡片式导航界面
- ✅ 聚合搜索 (Google/百度/Bing/GitHub/站内)
- ✅ 7 种随机进场动画
- ✅ 响应式设计 (完美适配移动端)
- ✅ 友情链接展示
- ✅ 广告位支持

### 后台管理
- ✅ 用户认证登录
- ✅ 主菜单管理
- ✅ 子菜单管理
- ✅ 导航卡片管理
- ✅ 友情链接管理
- ✅ 广告位管理

### 技术特性
- ✅ Vue 3 + Vite 6.0
- ✅ Express + SQLite
- ✅ JWT 认证
- ✅ Vercel Serverless
- ✅ 自动数据库初始化
- ✅ GitHub Actions CI/CD

---

## 📝 常见问题

### Q1: 部署失败怎么办?

**A**: 检查步骤:
1. Node.js 版本 >= 18 (`node -v`)
2. 依赖安装完整 (`npm install`)
3. `vercel.json` 格式正确
4. 查看 Vercel 构建日志

### Q2: API 404 错误?

**A**:
1. 检查 `vercel.json` 路由配置
2. 确认 `api/index.js` 存在
3. 本地测试: `vercel dev`

### Q3: 数据丢失怎么办?

**A**: Vercel `/tmp` 目录会定期清空。

**临时解决** (测试/演示):
- 接受数据丢失,每次自动初始化

**生产方案**:
- 使用外部数据库 (PlanetScale, Supabase)
- 修改 `api/index.js` 数据库连接

### Q4: 如何修改密码?

**A**: 两种方式:
1. 登录后台 → 用户管理 → 修改密码
2. 设置环境变量: `ADMIN_PASSWORD=新密码`

### Q5: 如何绑定自定义域名?

**A**:
1. Vercel 项目 → Settings → Domains
2. 添加域名 (如 nav.yourdomain.com)
3. 配置 DNS CNAME 记录:
   ```
   CNAME nav cname.vercel-dns.com
   ```
4. 等待 DNS 生效 (几分钟到几小时)

---

## 📚 文档索引

### 快速开始
- **3分钟部署**: [QUICKSTART.md](QUICKSTART.md)
- **部署指南**: [DEPLOY.md](DEPLOY.md)

### 详细文档
- **完整文档**: [README.md](README.md)
- **项目总结**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

### 技术文档
- **Vercel 配置**: [vercel.json](vercel.json)
- **前端 API**: [frontend/src/api.js](frontend/src/api.js)
- **后端 API**: [api/index.js](api/index.js)

---

## 🔄 更新部署

### 代码更新后重新部署

```bash
# 如果使用 GitHub
git add .
git commit -m "Update features"
git push
# GitHub Actions 自动部署

# 如果使用 Vercel CLI
vercel --prod
```

---

## 🎨 自定义配置

### 修改前端主题

编辑 `frontend/src/views/Home.vue`:

```vue
<!-- 修改背景渐变 -->
<div class="bg-gradient-to-br from-[#0a0e27] to-[#1e293b]">

<!-- 修改动画类型 -->
const animations = ['slideUp', 'radial', 'fadeIn', ...]
```

### 添加搜索引擎

编辑 `frontend/src/views/Home.vue`:

```javascript
const searchEngines = [
  // 现有引擎...
  {
    name: 'duckduckgo',
    label: 'DuckDuckGo',
    url: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`
  }
]
```

---

## 🛠️ 开发技巧

### 热更新调试

```bash
# Vercel Dev (推荐)
vercel dev

# 修改代码后自动重载
```

### 查看日志

```bash
# Vercel 实时日志
vercel logs

# 查看最近的错误
vercel logs --follow
```

### 预览部署

```bash
# 部署预览版本 (不影响生产)
vercel

# 获取预览 URL
# https://nav-pro-vercel-xxx.vercel.app
```

---

## ✅ 下一步

### 立即开始

```bash
cd D:\ebak\project\nave\nav-vercel
vercel --prod
```

### 或使用脚本

```cmd
deploy.bat       # Windows
./deploy.sh      # Linux/Mac
```

### 或推送到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/nav-pro-vercel.git
git push -u origin main
```

---

## 🎊 恭喜！

**Nav Pro Vercel 项目已准备就绪！**

**3 分钟即可完成部署:** 运行 `vercel --prod`

**任何问题?** 查看 [README.md](README.md) 完整文档

---

**生成时间**: 2025-10-21
**项目作者**: marry
**开源协议**: MIT
**源项目**: https://github.com/truelife0958/nav-pro
