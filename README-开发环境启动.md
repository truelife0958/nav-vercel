# Nav Pro 开发环境启动指南

## ⚠️ 重要提示

**本项目是一个前后端分离的全栈应用，需要同时启动前端和后端服务器才能正常工作！**

## 问题说明

如果您遇到以下错误:
- `Network Error`
- `ERR_CONNECTION_REFUSED`
- `Failed to connect to localhost port 3000`

**这是因为后端 API 服务器没有运行！**

## 启动步骤

### 方法一：使用批处理脚本（推荐）

1. **启动后端 API 服务器**
   - 双击项目根目录的 `start-api.bat` 文件
   - 会打开一个新的命令行窗口，显示 "🚀 Nav API Server running on port 3000"
   - **保持这个窗口打开**，不要关闭

2. **启动前端开发服务器**
   - 在新的命令行窗口中，进入项目根目录
   - 运行: `npm run dev`
   - 前端将在 `http://localhost:5173` 或 `http://localhost:5174` 运行

3. **访问应用**
   - 打开浏览器，访问前端地址
   - 现在前端可以正常连接后端 API 了

### 方法二：使用 npm 脚本

1. **启动后端**
   ```bash
   npm run dev:api
   ```

2. **在新窗口启动前端**
   ```bash
   npm run dev
   ```

### 方法三：手动启动

1. **后端服务器**
   ```bash
   cd api
   node index.js
   ```

2. **前端服务器（新窗口）**
   ```bash
   cd frontend
   npm run dev
   ```

## 验证服务器状态

### 检查后端是否运行
在浏览器访问: `http://localhost:3000/health`

应该看到类似输出:
```json
{
  "status": "ok",
  "timestamp": "2025-10-22T08:16:28.573Z",
  "database": "connected"
}
```

### 检查 API 端点
- 菜单: `http://localhost:3000/api/menus`
- 广告: `http://localhost:3000/api/ads`
- 友链: `http://localhost:3000/api/friends`

## 常见问题

### Q: 为什么每次都要启动后端？
A: 在开发环境中，前后端是独立运行的进程。关闭命令行窗口或重启电脑后，需要重新启动。

### Q: 可以自动启动吗？
A: 可以，但需要配置系统服务或使用进程管理工具（如 PM2）。

### Q: 为什么后端会自动停止？
A: 可能原因:
- 关闭了运行后端的命令行窗口
- 代码出现错误导致进程崩溃
- 电脑休眠或重启

### Q: 默认登录账号是什么？
A: 查看 `api/config.js` 文件中的 `admin` 配置。

## 端口说明

- **后端 API**: `http://localhost:3000`
- **前端开发服务器**: `http://localhost:5173` 或 `http://localhost:5174`

## 注意事项

1. **两个服务器必须同时运行**
2. **保持后端窗口打开**（或在后台运行）
3. 如果修改了后端代码，需要重启后端服务器
4. 前端代码修改会自动热重载，无需重启

## 生产环境部署

生产环境部署到 Vercel 时，不需要手动启动后端，Vercel 会自动处理。

---

**如果仍有问题，请检查:**
- Node.js 是否已安装（版本 >= 18）
- 端口 3000 是否被其他程序占用
- 防火墙是否阻止了本地连接
