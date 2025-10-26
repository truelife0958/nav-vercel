
# Vercel 环境变量配置指南

## 🎉 恭喜！数据库已创建成功

你已经成功创建了 Vercel Postgres（基于 Neon）数据库。现在需要将连接信息配置到 Vercel 项目中。

---

## 📋 已获取的数据库连接信息

从你提供的信息中，关键的连接字符串是：

```env
POSTGRES_URL=postgresql://neondb_owner:npg_6K3LjRcYGiHu@ep-calm-flower-a4n4w599-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**重要提示**：
- ✅ 使用 **Pooler** 版本（包含 `-pooler`）
- ✅ 已包含 `sslmode=require`（安全连接）
- ✅ 适合 Serverless 环境（Vercel）

---

## 🔧 配置步骤

### 步骤 1：访问 Vercel 项目设置

1. **打开浏览器，访问**：
   ```
   https://vercel.com/dashboard
   ```

2. **进入项目**：
   - 找到并点击项目 `nav-vercel`

3. **进入 Settings**：
   - 点击顶部导航的 **"Settings"** 标签

4. **进入 Environment Variables**：
   - 点击左侧边栏的 **"Environment Variables"**

---

### 步骤 2：检查并配置环境变量

#### 检查现有变量

查看是否已经有以下变量（Vercel 可能已自动添加）：

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

**如果已存在**：✅ 跳过这些变量（Vercel 已自动配置）

**如果不存在**：需要手动添加 `POSTGRES_URL`

---

#### 添加或更新 POSTGRES_URL（如果需要）

如果 `POSTGRES_URL` 不存在或需要更新：

1. **点击 "Add New" 或编辑现有变量**

2. **配置变量**：
   - **Name**: `POSTGRES_URL`
   - **Value**: 
     ```
     postgresql://neondb_owner:npg_6K3LjRcYGiHu@ep-calm-flower-a4n4w599-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
     ```
   - **Environments**: 
     - ✅ Production
     - ✅ Preview
     - ✅ Development

3. **点击 "Save"**

---

#### 添加应用必需的环境变量（重要！）

除了数据库连接信息，还需要添加应用相关的变量：

##### 1. JWT_SECRET（必需）

- **Name**: `JWT_SECRET`
- **Value**: 生成一个随机字符串（例如：`jwt-secret-key-change-this-to-random-string-12345`）
- **Environments**: 全选（Production, Preview, Development）
- **点击 "Save"**

**建议**：使用在线工具生成随机字符串
```
https://www.random.org/strings/
```
或者使用以下命令生成（如果有 Node.js）：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

##### 2. ADMIN_USERNAME（必需）

- **Name**: `ADMIN_USERNAME`
- **Value**: `admin`（或你喜欢的用户名）
- **Environments**: 全选
- **点击 "Save"**

##### 3. ADMIN_PASSWORD（必需）

- **Name**: `ADMIN_PASSWORD`
- **Value**: 设置一个安全的密码（例如：`Admin@123456`）
- **Environments**: 全选
- **点击 "Save"**

⚠️ **安全提醒**：
- 使用强密码（至少8位，包含大小写字母、数字）
- 不要使用简单密码如 `admin123`
- 建议使用密码管理器生成

---

### 步骤 3：确认所有环境变量

配置完成后，你应该看到以下环境变量：

#### 数据库相关（Vercel 自动添加）
```
✅ POSTGRES_URL
✅ POSTGRES_PRISMA_URL
✅ POSTGRES_URL_NON_POOLING
✅ POSTGRES_USER
✅ POSTGRES_HOST
✅ POSTGRES_PASSWORD
✅ POSTGRES_DATABASE
✅ POSTGRES_URL_NO_SSL
```

#### 应用相关（需要手动添加）
```
✅ JWT_SECRET
✅ ADMIN_USERNAME
✅ ADMIN_PASSWORD
```

**检查清单**：
- [ ] 至少有 `POSTGRES_URL` 或类似的数据库连接变量
- [ ] `JWT_SECRET` 已添加
- [ ] `ADMIN_USERNAME` 已添加
- [ ] `ADMIN_PASSWORD` 已添加
- [ ] 所有变量都选择了全部环境

---

### 步骤 4：触发重新部署

环境变量添加后，**必须**重新部署才能生效！

#### 方法 A：手动触发部署（推荐）

1. **返回项目主页**：
   - 点击顶部的项目名称或 Logo

2. **进入 Deployments**：
   - 点击顶部导航的 **"Deployments"** 标签

3. **找到最新部署**：
   - 在列表最上方找到最近的部署

4. **Redeploy**：
   - 点击部署右侧的 **三个点 `⋯`**
   - 选择 **"Redeploy"**
   - 在弹出窗口点击 **"Redeploy"** 确认

5. **等待部署完成**：
   - 观察部署进度
   - 等待状态变为 **"Ready"** ✅
   - 通常需要 30-60 秒

#### 方法 B：推送代码触发（备选）

如果你想通过代码推送触发部署：

```bash
# 在项目目录中执行
git commit --allow-empty -m "Trigger redeploy with Vercel Postgres"
git push origin main
```

---

### 步骤 5：验证数据库连接

部署完成后，验证数据库是否正常工作。

#### 5.1 测试健康检查 API

**方法 A：浏览器访问**
```
https://nav-vercel-eight.vercel.app/api/health
```

**方法 B：PowerShell（Windows）**
```powershell
Invoke-RestMethod -Uri "https://nav-vercel-eight.vercel.app/api/health"
```

**方法 C：curl（Mac/Linux）**
```bash
curl https://nav-vercel-eight.vercel.app/api/health
```

#### 5.2 检查返回结果

**成功示例**：
```json
{
  "status": "ok",
  "timestamp": "2025-10-26T04:00:00.000Z",
  "uptime": 123.456,
  "memory": {
    "rss": 76554240,
    "heapTotal": 15081472,
    "heapUsed": 13135240,
    "external": 5355152,
    "arrayBuffers": 1816347
  },
  "database": "initialized",
  "environment": "Vercel Serverless"
}
```

**关键检查点**：
- ✅ `"status": "ok"` - API 正常
- ✅ `"database": "initialized"` - 数据库已初始化（重要！）
- ✅ `"environment": "Vercel Serverless"` - 运行环境

**如果失败**（仍然显示内存数据库）：
```json
{
  "database": "in-memory (fallback)",
  ...
}
```
说明数据库连接失败，需要检查日志。

---

### 步骤 6：查看部署日志

如果数据库连接有问题，查看日志以诊断：

1. **进入 Functions 页面**：
   - 在项目中点击 **"Functions"** 标签

2. **选择 Function**：
   - 点击 `api/index.js`

3. **查看 Logs**：
   - 点击 **"Logs"** 标签
   - 查看最新的日志输出

4. **查找关键信息**：

   **成功的日志**：
   ```
   ✅ 检测到 POSTGRES_URL，尝试连接数据库
   ✅ 使用 Neon Serverless 连接 Postgres 数据库
   ✅ 数据库表结构创建完成
   ✅ 默认管理员账户已创建: admin
   🎉 数据库初始化完成！
   ```

   **失败的日志**：
   ```
   ❌ Postgres 初始化失败
   ❌ 自动降级到内存数据库
   ❌ Error: [具体错误信息]
   ```

---

## 🎯 测试完整功能

### 测试 1：访问主页

```
https://nav-vercel-eight.vercel.app/
```

- ✅ 页面正常加载
- ✅ 没有错误提示

### 测试 2：测试菜单 API

```bash
curl https://nav-vercel-eight.vercel.app/api/menus
```

**期望返回**：
```json
[]
```
（空数组，因为还没有添加菜单数据）

### 测试 3：登录管理后台

1. **访问管理页面**：
   ```
   https://nav-vercel-eight.vercel.app/admin
   ```

2. **使用管理员账户登录**：
   - **用户名**：你配置的 `ADMIN_USERNAME`
   - **密码**：你配置的 `ADMIN_PASSWORD`

3. **成功登录后**：
   - 可以添加菜单
   - 可以添加导航卡片
   - 数据会永久保存在 Postgres 中

### 测试 4：数据持久化验证

1. 在管理后台添加一个测试菜单
2. 关闭浏览器
3. 几分钟后重新访问网站
4. ✅ 数据仍然存在（说明持久化成功）

---

## 🔍 故障排除

### 问题 1：部署成功但仍显示内存数据库

**可能原因**：
- 环境变量未正确添加
- 没有选择正确的环境（Production）
- 部署时未包含新的环境变量

**解决方案**：
1. 重新检查环境变量配置
2. 确保选择了 Production 环境
3. 再次触发 Redeploy

### 问题 2：连接超时或失败

**可能原因**：
- Neon 数据库区域距离太远
- 连接字符串格式错误

**解决方案**：
1. 确认使用 Pooler 版本的连接字符串（包含 `-pooler`）
2. 确认连接字符串包含 `sslmode=require`
3. 检查是否有网络限制

### 问题 3：管理员登录失败

**可能原因**：
- `ADMIN_USERNAME` 或 `ADMIN_PASSWORD` 未设置
- 数据库未正确初始化

**解决方案**：
1. 确认环境变量已添加
2. 检查部署日志确认 "默认管理员账户已创建"
3. 使用配置的用户名和密码登录

---

## 📊 数据库连接信息说明

你提供的连接信息中包含多种格式：

### 推荐使用（Serverless 优化）
```env
POSTGRES_URL=postgresql://neondb_owner:npg_6K3LjRcYGiHu@ep-calm-flower-a4n4w599-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```
- ✅ 使用 Connection Pooler（`-pooler`）
- ✅ 适合 Serverless 环境
- ✅ 自动管理连接池
- ✅ 无连接数限制

### 不推荐使用（直连）
```env
POSTGRES_URL_NON_POOLING=postgresql://neondb_owner:npg_6K3LjRcYGiHu@ep-calm-flower-a4n4w599.us-east-1.aws.neon.tech/neondb?sslmode=require
```
- ❌ 不使用 Pooler
- ❌ 不适合 Serverless
- ❌ 可能导致连接耗尽

**重要**：Vercel 应该已经自动为你配置了正确的版本。

---

## ✅ 完成检查清单

配置完成后，确认以下所有项：

- [ ] Vercel Postgres 数据库已创建
- [ ] 环境变量 `POSTGRES_URL` 已配置
- [ ] 环境变量 `JWT_SECRET` 已添加
- [ ] 环境变量 `ADMIN_USERNAME` 已添加
- [ ] 环境变量 `ADMIN_PASSWORD` 