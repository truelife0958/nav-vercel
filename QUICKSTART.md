# 🚀 快速开始

## 立即部署 (3分钟)

### 方式一: 一键部署脚本

**Windows:**
```cmd
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh && ./deploy.sh
```

### 方式二: Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

### 方式三: GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/nav-pro-vercel.git
git push -u origin main
```

然后访问 https://vercel.com/new 导入仓库。

---

## 本地开发

```bash
# 安装依赖
cd frontend && npm install
cd ../api && npm install

# 启动开发服务器
vercel dev
```

访问: http://localhost:3000

---

## 默认账号

- **用户名**: admin
- **密码**: 123456

⚠️ 生产环境请修改密码！

---

## 文档

- **完整文档**: [README.md](README.md)
- **部署指南**: [DEPLOY.md](DEPLOY.md)
- **项目总结**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

**立即开始**: `vercel --prod` ✨
