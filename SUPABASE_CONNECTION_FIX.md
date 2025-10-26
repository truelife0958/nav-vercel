# Supabase 连接修复指南

## 🔍 问题诊断

当前 Supabase 连接失败，错误信息：
```
NeonDbError: fetch failed
getaddrinfo ENOTFOUND aws-0-ap-southeast-1.pooler.supabase.com
```

可能原因：
- ❌ Supabase 项目已暂停或删除
- ❌ 连接字符串配置错误
- ❌ Vercel 环境变量未正确设置
- ❌ 数据库 Pooler 配置问题

---

## 🔧 修复步骤

### 步骤 1：检查 Supabase 项目状态

1. **访问 Supabase Dashboard**
   ```
   https://app.supabase.com/
   ```

2. **检查项目状态**
   - 登录后查看项目列表
   - 确认项目是否显示为 **Active**（绿色）
   - 如果显示 **Paused**（灰色），需要恢复项目

3. **恢复暂停的项目**（如果需要）
   - 点击项目
   - 点击 **Restore** 或 **Resume** 按钮
   - 等待项目启动（可能需要1-2分钟）

---

### 步骤 2：获取正确的连接字符串

#### 方法 A：使用 Connection Pooler（推荐 - Serverless）

1. **进入项目设置**
   - 点击左侧边栏的 **Settings** ⚙️
   - 选择 **Database**

2. **选择 Connection Pooling**
   - 找到 **Connection Pooling** 部分
   - 确保 Pooler 已启用（Enable Pooler）

3. **复制连接字符串**
   - **Connection string** 下拉选择 **Transaction**（Serverless 推荐）
   - 点击 **Copy** 复制完整连接字符串
   - 格式示例：
     ```
     postgres://postgres.xxxxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
     ```

4. **替换密码**
   - 将 `[YOUR-PASSWORD]` 替换为你的实际数据库密码
   - 如果忘记密码，点击 **Reset Database Password** 重置

#### 方法 B：使用直连（备选 - 长连接）

1. **选择 Direct Connection**
   - 在 **Connection string** 下拉选择 **Direct connection**
   - 格式示例：
     ```
     postgres://postgres.[project-ref]:[YOUR-PASSWORD]@db.[project-ref].supabase.co:5432/postgres
     ```

2. **注意事项**
   - ⚠️ 直连不适合 Serverless（Vercel Functions）
   - ⚠️ 可能导致连接池耗尽
   - ✅ 仅在 Pooler 不可用时使用

---

### 步骤 3：更新 Vercel 环境变量

1. **访问 Vercel Dashboard**
   ```
   https://vercel.com/dashboard
   ```

2. **进入项目设置**
   - 选择项目 `nav-vercel`
   - 点击顶部 **Settings** 标签
   - 点击左侧 **Environment Variables**

3. **更新 POSTGRES_URL**
   - 找到 `POSTGRES_URL` 变量
   - 如果不存在，点击 **Add New** 创建
   - **Name**: `POSTGRES_URL`
   - **Value**: 粘贴步骤2复制的连接字符串
   - **Environment**: 全选（Production, Preview, Development）
   - 点击 **Save**

4. **验证其他必需变量**
   确保以下变量已设置：
   ```env
   POSTGRES_URL=postgres://postgres.[项目引用]:[密码]@aws-0-[区域].pooler.supabase.com:5432/postgres
   JWT_SECRET=your-super-secret-key-change-this
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password
   ```

---

### 步骤 4：重新部署项目

#### 方法 A：触发新部署（推荐）

1. **返回项目主页**
   - 点击顶部 **Deployments** 标签

2. **Redeploy 最新部署**
   - 找到最新的部署记录
   - 点击右侧三个点 `⋯`
   - 选择 **Redeploy**
   - 确认 **Redeploy**

#### 方法 B：推送代码触发（备选）

```bash
# 在本地项目目录
git commit --allow-empty -m "Trigger redeployment"
git push origin main
```

---

### 步骤 5：验证连接

#### 5.1 等待部署完成
- 在 Vercel Dashboard 查看部署状态
- 等待显示 **Ready** ✅

#### 5.2 测试健康检查 API
```bash
curl https://nav-vercel-eight.vercel.app/api/health
```

**期望返回**（成功）：
```json
{
  "status": "ok",
  "timestamp": "2025-10-26T...",
  "uptime": 123.456,
  "memory": {...},
  "database": "initialized",
  "environment": "Vercel Serverless"
}
```

**如果返回**（失败）：
```json
{
  "status": "ok",
  "database": "initialized",
  ...
}
```
但在部署日志中看到 "降级到内存数据库" 警告，说明连接仍然失败。

#### 5.3 检查部署日志

1. **查看 Function 日志**
   - Vercel Dashboard → 项目
   - 点击 **Functions** 标签
   - 选择 `api/index.js`
   - 查看 **Logs**

2. **查找关键信息**
   - ✅ `"使用 Neon Serverless 连接 Postgres 数据库"`
   - ✅ `"数据库初始化完成！"`
   - ❌ `"Postgres 初始化失败，自动降级到内存数据库"`
   - ❌ `"fetch failed"` 或 `"ENOTFOUND"`

---

## 🔍 故障排除

### 问题 1：ENOTFOUND 错误持续

**可能原因**：
- Supabase Pooler 域名解析失败
- Vercel 网络无法访问 Supabase

**解决方案**：
1. 确认 Supabase 项目区域
2. 尝试使用不同区域的 Pooler
3. 联系 Supabase 支持确认 Pooler 状态

### 问题 2：连接超时

**可能原因**：
- Supabase 项目已暂停
- Pooler 未启用

**解决方案**：
1. 恢复 Supabase 项目
2. 在 Supabase Dashboard 启用 Connection Pooler
3. 等待几分钟后重试

### 问题 3：认证失败

**可能原因**：
- 密码错误
- 连接字符串格式错误

**解决方案**：
1. 重置数据库密码
2. 重新复制连接字符串
3. 确保密码中的特殊字符已正确 URL 编码

### 问题 4：Connection Pool 耗尽

**可能原因**：
- 使用直连而非 Pooler
- 并发请求过多

**解决方案**：
1. 切换到 Transaction Pooler
2. 在 Supabase 增加 Pool Size
3. 优化代码减少连接数

---

## 📊 连接字符串格式对比

### Pooler（Transaction Mode - 推荐）
```
postgres://postgres.[项目引用]:[密码]@aws-0-[区域].pooler.supabase.com:5432/postgres
```
- ✅ 适合 Serverless
- ✅ 自动连接池管理
- ✅ 无连接数限制

### Pooler（Session Mode）
```
postgres://postgres.[项目引用]:[密码]@aws-0-[区域].pooler.supabase.com:6543/postgres
```
- ⚠️ 需要长连接
- ⚠️ 不适合 Serverless

### Direct Connection
```
postgres://postgres.[项目引用]:[密码]@db.[项目引用].supabase.co:5432/postgres
```
- ❌ 不适合 Serverless
- ❌ 易耗尽连接池
- ✅ 仅用于调试

---

## 🎯 快速检查清单

部署前检查：
- [ ] Supabase 项目状态为 Active
- [ ] Connection Pooler 已启用
- [ ] 使用 Transaction 模式连接字符串
- [ ] 密码已正确替换
- [ ] `POSTGRES_URL` 环境变量已更新
- [ ] 所有环境变量都已设置

部署后验证：
- [ ] Vercel 部署状态为 Ready
- [ ] `/api/health` 返回 `"database": "initialized"`
- [ ] Function 日志无 "降级到内存数据库" 警告
- [ ] Function 日志显示 "数据库初始化完成"

---

## 💡 最佳实践

### 1. 使用环境变量管理敏感信息
```env
# 不要在代码中硬编码连接字符串
POSTGRES_URL=postgres://...
```

### 2. 使用 Transaction Pooler
```
端口 5432 (Transaction Mode) ✅
端口 6543 (Session Mode) ❌
```

### 3. 监控连接状态
```sql
-- 在 Supabase SQL Editor 查看活动连接
SELECT * FROM pg_stat_activity;
```

### 4. 定期检查项目状态
- Supabase 免费项目会在不活跃时暂停
- 至少每周访问一次网站保持活跃

---

## 🆘 仍然无法连接？

### 选项 1：切换到 Vercel Postgres
最简单的解决方案，无需配置：
- 参考 [`VERCEL_POSTGRES_SETUP.md`](VERCEL_POSTGRES_SETUP.md)
- 5分钟即可完成设置
- 与 Vercel 深度集成

### 选项 2：使用其他 Postgres 服务
- **Neon**：https://neon.tech/
- **Railway**：https://railway.app/
- **Render**：https://render.com/

### 选项 3：联系支持
- **Supabase 支持**：https://supabase.com/support
- **Vercel 支持**：https://vercel.com/support
- **GitHub Issues**：在项目仓库提交 Issue

---

## 📚 相关资源

- [Supabase Database Settings](https://app.supabase.com/project/_/settings/database)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)

---

## ✅ 完成

按照以上步骤操作后，你的 Supabase 连接应该可以正常工作了！

如有任何问题，随时查看日志或寻求帮助。祝使用愉快！🚀