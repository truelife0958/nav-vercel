@echo off
REM Nav Pro Vercel 快速部署脚本 (Windows)
REM 作者: marry
REM 用途: 一键部署到 Vercel

echo.
echo ========================================
echo   Nav Pro Vercel 部署脚本 (Windows)
echo ========================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未安装 Node.js
    echo 请访问 https://nodejs.org 下载安装
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
node -v
echo.

REM 检查 npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未安装 npm
    pause
    exit /b 1
)

echo ✅ npm 已安装
npm -v
echo.

REM 检查 Vercel CLI
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 安装 Vercel CLI...
    call npm install -g vercel
)

echo ✅ Vercel CLI 已安装
echo.

REM 询问部署类型
echo 请选择部署类型:
echo [1] 开发预览 (Development)
echo [2] 生产部署 (Production)
echo.
set /p deploy_type="请输入选项 (1 或 2): "

echo.

if "%deploy_type%"=="1" (
    echo 📦 部署到开发环境...
    call vercel
) else if "%deploy_type%"=="2" (
    echo 🚀 部署到生产环境...
    call vercel --prod
) else (
    echo ❌ 无效选项
    pause
    exit /b 1
)

echo.
echo ✅ 部署完成！
echo.
echo 📝 提示:
echo   - 访问 https://vercel.com/dashboard 查看部署详情
echo   - 首次部署需要登录 Vercel 账号
echo   - 生产环境域名会自动生成
echo.
pause
