# 📦 快速部署文档

## 🚀 三种部署方式

### 方式一: 使用部署脚本 (推荐新手)

#### Windows 用户

```cmd
# 双击运行
deploy.bat

# 或命令行运行
.\deploy.bat
```

#### Linux/Mac 用户

```bash
# 添加执行权限
chmod +x deploy.sh

# 运行脚本
./deploy.sh
```

**脚本功能**:
- ✅ 自动检查环境 (Node.js, npm)
- ✅ 自动安装 Vercel CLI
- ✅ 交互式选择部署类型
- ✅ 一键完成部署

---

### 方式二: 手动命令行部署

```bash
# 1. 安装 Vercel CLI (首次使用)
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署到开发环境 (预览)
vercel

# 4. 部署到生产环境
vercel --prod
```

---

### 方式三: GitHub 自动部署 (推荐团队)

#### 步骤 1: 连接 GitHub

```bash
# 初始化 Git
git init

# 添加文件
git add .
git commit -m "Initial commit"

# 连接远程仓库
git remote add origin https://github.com/你的用户名/nav-pro-vercel.git
git push -u origin main
```

#### 步骤 2: 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets:

1. 访问: `https://github.com/你的用户名/nav-pro-vercel/settings/secrets/actions`
2. 点击 "New repository secret"
3. 添加以下 Secrets:

| Secret Name | 获取方式 | 说明 |
|------------|---------|------|
| `VERCEL_TOKEN` | https://vercel.com/account/tokens | Vercel API Token |
| `VERCEL_ORG_ID` | vercel.json 或项目设置 | 组织 ID |
| `VERCEL_PROJECT_ID` | vercel.json 或项目设置 | 项目 ID |

**获取 ORG_ID 和 PROJECT_ID**:
```bash
# 本地部署一次
vercel

# 查看 .vercel/project.json
cat .vercel/project.json
```

#### 步骤 3: 推送触发部署

```bash
# 每次推送代码自动部署
git add .
git commit -m "Update feature"
git push

# GitHub Actions 会自动:
# 1. 检查代码
# 2. 安装依赖
# 3. 构建项目
# 4. 部署到 Vercel
# 5. 评论部署链接 (PR)
```

---

## 🔧 部署前检查

### 环境检查

```bash
# 检查 Node.js 版本 (需要 >= 18)
node -v

# 检查 npm 版本
npm -v

# 检查 Git (GitHub 部署需要)
git --version
```

### 依赖安装

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../api
npm install

# 返回根目录
cd ..
```

### 本地测试

```bash
# 本地运行 Vercel 环境
vercel dev

# 访问 http://localhost:3000
```

---

## 📊 部署状态监控

### Vercel Dashboard

- **访问**: https://vercel.com/dashboard
- **查看**:
  - 部署历史
  - 构建日志
  - 运行时日志
  - 性能指标

### GitHub Actions

- **访问**: https://github.com/你的用户名/nav-pro-vercel/actions
- **查看**:
  - 工作流运行状态
  - 构建日志
  - 部署结果

---

## ❓ 常见问题

### Q: 首次部署需要什么?

**A**: 只需要:
1. Vercel 账号 (免费，使用 GitHub 登录)
2. Node.js >= 18
3. 运行 `vercel` 命令

### Q: 部署失败怎么办?

**A**: 检查步骤:
1. 查看构建日志 (Vercel Dashboard)
2. 检查依赖是否完整 (`npm install`)
3. 本地测试 (`vercel dev`)
4. 查看错误信息

### Q: 如何回滚部署?

**A**:
1. Vercel Dashboard → Deployments
2. 找到之前的成功部署
3. 点击 "..." → "Promote to Production"

### Q: 部署后如何更新?

**A**:
```bash
# 修改代码后
git add .
git commit -m "Update"
git push

# 或手动部署
vercel --prod
```

---

## 🎯 部署最佳实践

### 1. 使用环境变量

```bash
# 本地开发
cp .env.example .env

# Vercel 生产环境
# 在 Dashboard 设置环境变量
```

### 2. 分支策略

- `main/master` → 生产环境
- `develop` → 开发环境
- `feature/*` → 预览环境

### 3. 自动化测试

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test
```

### 4. 版本标签

```bash
# 发布新版本
git tag v1.0.0
git push --tags

# 自动部署到生产
```

---

## 🚀 快速开始命令

```bash
# 完整流程 (3分钟)
git clone https://github.com/你的用户名/nav-pro-vercel.git
cd nav-pro-vercel
vercel --prod
```

**就这么简单！** ✨

---

## 📞 获取帮助

- **Vercel 文档**: https://vercel.com/docs
- **GitHub Issues**: https://github.com/你的用户名/nav-pro-vercel/issues
- **社区支持**: https://github.com/vercel/vercel/discussions

---

**祝部署顺利！** 🎉
