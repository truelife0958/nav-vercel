# 自动化数据库写入测试

$baseUrl = "https://nav-vercel-eight.vercel.app/api"
$username = "admin"
$password = "lk87654321"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  数据库写入功能自动测试" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 步骤 1: 登录
Write-Host "步骤 1: 登录管理员账户..." -ForegroundColor Yellow

try {
    $loginBody = @{
        username = $username
        password = $password
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.token) {
        Write-Host "✅ 登录成功！" -ForegroundColor Green
        $token = $loginResponse.token
    } else {
        Write-Host "❌ 登录失败：未返回 token" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ 登录失败" -ForegroundColor Red
    Write-Host "错误: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "详情: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# 步骤 2: 添加测试菜单
Write-Host "步骤 2: 添加测试菜单..." -ForegroundColor Yellow

try {
    $menuBody = @{
        name = "测试菜单"
        icon = "📝"
        sort_order = 1
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $menuResponse = Invoke-RestMethod -Uri "$baseUrl/menus" -Method Post -Body $menuBody -Headers $headers
    
    Write-Host "✅ 菜单添加成功！" -ForegroundColor Green
    Write-Host "   ID: $($menuResponse.id)" -ForegroundColor Gray
    Write-Host "   名称: $($menuResponse.name)" -ForegroundColor Gray
    $menuId = $menuResponse.id
} catch {
    Write-Host "❌ 菜单添加失败" -ForegroundColor Red
    Write-Host "错误: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "详情: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# 步骤 3: 添加测试卡片
Write-Host "步骤 3: 添加测试卡片..." -ForegroundColor Yellow

try {
    $cardBody = @{
        menu_id = $menuId
        title = "Google"
        url = "https://www.google.com"
        logo_url = "https://www.google.com/favicon.ico"
        desc = "全球最大的搜索引擎"
        sort_order = 1
    } | ConvertTo-Json

    $cardResponse = Invoke-RestMethod -Uri "$baseUrl/cards" -Method Post -Body $cardBody -Headers $headers
    
    Write-Host "✅ 卡片添加成功！" -ForegroundColor Green
    Write-Host "   ID: $($cardResponse.id)" -ForegroundColor Gray
    Write-Host "   标题: $($cardResponse.title)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 卡片添加失败" -ForegroundColor Red
    Write-Host "错误: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "详情: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# 步骤 4: 验证数据
Write-Host "步骤 4: 验证数据..." -ForegroundColor Yellow

try {
    $menusCheck = Invoke-RestMethod -Uri "$baseUrl/menus" -Method Get
    
    if ($menusCheck.Count -gt 0) {
        Write-Host "✅ 菜单数据已保存！数量: $($menusCheck.Count)" -ForegroundColor Green
        $menusCheck | ForEach-Object {
            Write-Host "   - $($_.name)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ 菜单列表为空" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 验证失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 步骤 5: 测试持久化
Write-Host "步骤 5: 测试数据持久化（等待3秒）..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    $menusCheck2 = Invoke-RestMethod -Uri "$baseUrl/menus" -Method Get
    
    if ($menusCheck2.Count -gt 0) {
        Write-Host "✅ 数据持久化成功！" -ForegroundColor Green
    } else {
        Write-Host "❌ 数据未持久化" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 持久化测试失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ 测试完成！" -ForegroundColor Green
Write-Host ""
Write-Host "现在访问网站查看结果:" -ForegroundColor Cyan
Write-Host "https://nav-vercel-eight.vercel.app/" -ForegroundColor White
Write-Host ""