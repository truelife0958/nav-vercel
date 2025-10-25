@echo off
echo ====================================
echo 启动 Nav API 后端服务器
echo ====================================
echo.

cd /d "%~dp0api"
echo 正在启动后端服务器...
echo 服务器将在此窗口运行，请保持窗口打开
echo 按 Ctrl+C 可以停止服务器
echo.
node index.js

pause
