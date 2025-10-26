
# Vercel Postgres 快速设置指南（5分钟完成）

## 🎯 目标

为你的导航网站项目配置 Vercel Postgres，实现数据持久化。

---

## ✅ 前提条件

- [x] 项目已部署到 Vercel
- [x] 代码已支持 Postgres（已完成）
- [x] 有 Vercel 账户访问权限

---

## 📋 操作步骤

### 步骤 1：访问 Vercel Dashboard

1. **打开浏览器，访问**：
   ```
   https://vercel.com/dashboard
   ```

2. **登录你的 Vercel 账户**

3. **找到并点击项目**：
   - 在项目列表中找到 `nav-vercel`
   - 点击项目名称进入项目页面

---

### 步骤 2：进入 Storage 页面

1. **点击顶部导航栏的 Storage 标签**
   ```
   Overview | Deployments | Analytics | Logs | Storage | Settings
                                                    ↑ 点击这里
   ```

2. **如果是第一次使用**，你会看到：
   - Storage 选项介绍页面
   - 不同类型的数据库选项

---

### 步骤 3：创建 Postgres 数据库

1. **点击 "Create Database" 或 "Create" 按钮**

2. **选择数据库类型**：
   - 看到多个选项：Postgres, KV, Blob, Edge Config
   - **点击 "Postgres"** ✅

3. **配置数据库**：
   
   #### Database Name（数据库名称）
   - 输入名称，例如：`nav-database`
   - 或保持默认名称
   
   #### Region（区域）
   - **推荐选择**：
     - 🇭🇰 **Hong Kong (hkg1)** - 距离中国大陆最近
     - 🇸🇬 **Singapore (sin1)** - 备选，也很快
     - 🇯🇵 **Tokyo (nrt1)** - 日本东京
   - ⚠️ 避免选择：美国、欧洲区域（延迟较高）
   
   #### Plan（套餐）
   - 选择 **Hobby** (Free)
   - 包含：
     - 💾 256 MB 存储
     - ⚡ 60 小时计算时间/月
     - 📊 无限查询（有合理使用限制）

4. **点击 "Create" 按钮**
   - 等待几秒钟，数据库创建中...
   - 看到 ✅ "Database created successfully"

---

### 步骤 4：连接数据库到项目

创建完成后，你会看到数据库详情页面：

1. **查看连接信息**（自动显示）
   - 你会看到环境变量已自动生成
   - 包含：`POSTGRES_URL`, `POSTGRES_PRISMA_URL` 等

2. **点击 "Connect Project" 按钮**
   
3. **在弹出窗口中**：
   - **Select a project**: 选择 `nav-vercel`
   - **Select environment**: 全选（Production, Preview, Development）
   - 点击 **"Connect"** 按钮

4. **看到成功提示**：
   ```
   ✅ Connected to nav-vercel
   Environment variables added successfully
   ```

---

### 步骤 5：添加其他必需的环境变量

虽然数据库已连接，但还需要配置应用相关的环境变量。

1. **点击项目名称返回项目主页**（或点击浏览器后退按钮）

2. **进入 Settings**：
   - 点击顶部导航的 **"Settings"** 标签

3. **进入 Environment Variables**：
   - 点击左侧边栏的 **"Environment Variables"**

4. **检查已有的变量**：
   - 你应该看到 Vercel 自动添加的：
     - ✅ `POSTGRES_URL`
     - ✅ `POSTGRES_PRISMA_URL`
     - ✅ `POSTGRES_URL_NON_POOLING`
     - 等等...

5. **添加应用必需的变量**：

   #### 添加 JWT_SECRET
   - 点击 **"Add New"** 按钮
   - **Name**: `JWT_SECRET`
   - **Value**: 输入一个随机字符串（例如：`my-super-secret-jwt-key-change-this-12345`）
   - **Environments**: 全选（Production, Preview, Development）
   - 点击 **"Save"**

   #### 添加 ADMIN_USERNAME
   - 点击 **"Add New"**
   - **Name**: `ADMIN_USERNAME`
   - **Value**: `admin`（或你喜欢的用户名）
   - **Environments**: 全选
   - 点击 **"Save"**

   #### 添加 ADMIN_PASSWORD
   - 点击 **"Add New"**
   - **Name**: `ADMIN_PASSWORD`
   - **Value**: 输入一个安全的密码（例如：`Admin@12345`）
   - **Environments**: 全选
   - 点击 **"Save"**

6. **确认所有变量都已添加**：
   ```
   ✅ POSTGRES_URL (自动添加)
   ✅ JWT_SECRET (手动添加)
   ✅ ADMIN_USERNAME (手动添加)
   ✅ ADMIN_PASSWORD (手动添加)
   ```

---

### 步骤 6：重新部署项目

添加环境变量后，需要重新部署以应用更改。

1. **返回项目主页**：
   - 点击顶部的项目名称

2. **进入 Deployments 页面**：
   - 点击顶部导航的 **"Deployments"** 标签

3. **找到最新的部署**：
   - 应该在列表最上方
   - 状态为 "Ready" 或 "Building"

4. **触发重新部署**：
   - 点击最新部署右侧的 **三个点 `⋯`**
   - 在下拉菜单中选择 **"Redeploy"**
   - 在弹出窗口点击 **"Redeploy"** 确认

5. **等待部署完成**：
   - 观察部署状态
   - 等待变为 **"Ready"** ✅
   - 通常需要 30-60 秒

---

### 步骤 7：验证数据库连接

部署完成后，验证数据库是否正常工作。

#### 方法 A：浏览器测试

1. **访问健康检查 API**：
   ```
   https://nav-vercel-eight.vercel.app/api/health
   ```

2. **查看返回结果**：
   
   **成功示例**：
   ```json
   {
     "status": "ok",
     "timestamp": "2025-10-26T03:55:00.000Z",
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
   
   **关键字段**：
   - ✅ `"status": "ok"` - API 正常
   - ✅ `"database": "initialized"` - 数据库已初始化
   - ✅ `"environment": "Vercel Serverless"` - 运行环境

#### 方法 B：PowerShell 测试（Windows）

```powershell
# 在 PowerShell 中运行
Invoke-RestMethod -Uri "https://nav-vercel-eight.vercel.app/api/health" | ConvertTo-Json
```

#### 方法 C：命令行测试（Mac/Linux）

```bash
curl https://nav-vercel-eight.vercel.app/api/health
```

---

### 步骤 8：查看部署日志（可选）

如果想确认数据库连接详情，可以查看部署日志。

1. **进入 Functions 页面**：
   - 在项目中点击 **"Functions"** 标签

2. **选择 API Function**：
   - 点击 `api/index.js`

3. **查看 Logs**：
   - 点击 **"Logs"** 标签
   - 查看最新的日志输出

4. **查找关键信息**：
   
   **成功的日志应该包含**：
   ```
   ✅ 检测到 POSTGRES_URL，尝试连接数据库
   ✅ 使用 Neon Serverless 连接 Postgres 数据库
   ✅ 数据库表结构创建完成
   ✅ 默认管理员账户已创建: admin
   🎉 数据库初始化完成！
   ```
   
   **不应该看到**：
   ```
   ❌ Postgres 初始化失败
   ❌ 自动降级到内存数据库
   ❌ fetch failed
   ```

---

## ✅ 完成检查清单

配置完成后，确认以下所有项：

- [ ] ✅ Vercel Postgres 数据库已创建
- [ ] ✅ 数据库已连接到项目
- [ ] ✅ `POSTGRES_URL` 环境变量已自动添加
- [ ] ✅ `JWT_SECRET` 环境变量已手动添加
- [ ] ✅ `ADMIN_USERNAME` 环境变量已添加
- [ ] ✅ `ADMIN_PASSWORD` 环境变量已添加
- [ ] ✅ 项目已重新部署
- [ ] ✅ 部署状态为 "Ready"
- [ ] ✅ `/api/health` 返回 `"database": "initialized"`
- [ ] ✅ 部署日志显示 "数据库初始化完成"

如果以上全部打勾 ✅，恭喜你已成功配置！

---

## 🎯 测试功能

### 测试 1：访问主页

```
https://nav-vercel-eight.vercel.app/
```

- ✅ 页面正常加载
- ✅ 没有错误提示

### 测试 2：测试 API

```bash
# 获取菜单列表
curl https://nav-vercel-eight.vercel.app/api/menus

# 应该返回空数组（因为还没添加数据）
[]
```

### 测试 3：登录管理后台

1. 访问：`https://nav-vercel-eight.vercel.app/admin`
2. 使用配置的管理员账户登录：
   - 用户名：你配置的 `ADMIN_USERNAME`
   - 密码：你配置的 `ADMIN_PASSWORD`
3. 成功登录后可以添加菜单和卡片

---

## 🎊 数据库管理

### 查看数据库数据

1. **在 Vercel Dashboard**：
   - Storage → 你的数据库 → **Data** 标签

2. **使用 SQL 查询**：
   - 可以直接在浏览器中运行 SQL 查询
   - 例如查看所有菜单：
     ```sql
     SELECT * FROM menus;
     ```

### 备份数据（可选）

1. **导出数据**：
   - Storage → 数据库 → **Settings**
   - 找到 Backup 选项
   - 点击 Create Backup

### 监控使用情况

1. **查看用量**：
   - Storage → 数据库 → **Usage** 标签
   - 可以看到：
     - 存储空间使用量
     - 计算时间使用量
     - 查询次数

---

## 📊 免费额度说明

Vercel Postgres Hobby 套餐包含：

| 资源 | 额度 | 说明 |
|------|------|------|
| **存储空间** | 256 MB | 足够存储几千条数据 |
| **计算时间** | 60 小时/月 | 相当于每天 2 小时活跃使用 |
| **数据传输** | 256 MB | 出站数据传输 |
| **查询数** | 无限制* | 