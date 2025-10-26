# 测试登录 API
$body = @{
    username = 'admin'
    password = '123456'
} | ConvertTo-Json

Write-Host "测试登录 API..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri 'https://nav-vercel-eight.vercel.app/api/login' -Method Post -ContentType 'application/json' -Body $body
    Write-Host "✅ 登录成功!" -ForegroundColor Green
    Write-Host "Token: $($response.token.Substring(0, 50))..." -ForegroundColor Yellow
    Write-Host "User: $($response.user.username)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ 登录失败: $_" -ForegroundColor Red
}

Write-Host "`n测试健康检查..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri 'https://nav-vercel-eight.vercel.app/api/health'
    Write-Host "✅ 健康检查成功!" -ForegroundColor Green
    Write-Host ($health | ConvertTo-Json) -ForegroundColor Yellow
} catch {
    Write-Host "❌ 健康检查失败: $_" -ForegroundColor Red
}