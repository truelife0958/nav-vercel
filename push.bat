@echo off
echo ========================================
echo Git Push 脚本
echo ========================================
echo.
echo 当前待推送的提交:
git log origin/main..HEAD --oneline
echo.
echo ========================================
echo 开始推送到 GitHub...
echo ========================================
echo.

:retry
git push origin main
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ 推送成功！
    echo ========================================
    echo.
    echo Vercel 将在 1-2 分钟内自动部署
    echo.
    pause
    exit /b 0
) else (
    echo.
    echo ❌ 推送失败，可能的原因：
    echo 1. 网络连接问题
    echo 2. GitHub 访问受限
    echo 3. 需要配置代理
    echo.
    choice /C YN /M "是否重试"
    if errorlevel 2 goto end
    if errorlevel 1 goto retry
)

:end
echo.
echo 如果持续失败，请尝试：
echo 1. 使用 GitHub Desktop 推送
echo 2. 配置 VPN 或代理
echo 3. 使用 SSH 而非 HTTPS
echo.
pause