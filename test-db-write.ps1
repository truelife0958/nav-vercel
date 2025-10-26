# 测试数据库写入功能

$baseUrl = "https://nav-vercel-eight.vercel.app/api"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  数据库写入功能测试" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 步骤 1: 登录获取 token
Write-Host "步骤 1: 登录管理员账户..." -ForegroundColor Yellow

$username = Read-Host "请输入管理员用户名 (默认: admin)"
if ([string]::IsNullOrWhiteSpace($username)) {
    $username = "admin"
}

$password = Read-Host "请输入管理员密码" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

try {
    $loginBody = @{
        username = $username
        password = $passwordPlain
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.token) {
        Write-Host "✅ 登录成功！" -ForegroundColor Green
        $token = $loginResponse.token
        Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
    } else {
        Write-Host "❌ 登录失败：未返回 token" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ 登录失败：$($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "详细信息：$($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan

# 步骤 2: 添加测试菜单
Write-Host ""
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
    Write-Host "菜单 ID: $($menuResponse.id)" -ForegroundColor Gray
    Write-Host "菜单名称: $($menuResponse.name)" -ForegroundColor Gray
    $menuId = $menuResponse.id
} catch {
    Write-Host "❌ 菜单添加失败：$($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "详细信息：$($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan

# 步骤 3: 添加测试卡片
Write-Host ""
Write-Host "步骤 3: 添加测试卡片..." -ForegroundColor Yellow

try {
    $cardBody = @{
        menu_id = $menuId
        title = "测试网站"
        url = "https://www.example.com"
        logo_url = "https://www.example.com/favicon.ico"
        desc = "这是一个测试卡片"
        sort_order = 1
    } | ConvertTo-Json

    $cardResponse = Invoke-RestMethod -Uri "$baseUrl/cards" -Method Post -Body $cardBody -Headers $headers
    
    Write-Host "✅ 卡片添加成功！" -ForegroundColor Green
    Write-Host "卡片 ID: $($cardResponse.id)" -ForegroundColor Gray
    Write-Host "卡片标题: $($cardResponse.title)" -ForegroundColor Gray
    $cardId = $cardResponse.id
} catch {
    Write-Host "❌ 卡片添加失败：$($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "详细信息：$($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    # 继续执行，不退出
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan

# 步骤 4: 验证数据是否保存
Write-Host ""
Write-Host "步骤 4: 验证数据是否成功保存..." -ForegroundColor Yellow

try {
    Write-Host ""
    Write-Host "4.1 检查菜单列表..." -ForegroundColor Cyan
    $menusCheck = Invoke-RestMethod -Uri "$baseUrl/menus" -Method Get
    
    if ($menusCheck.Count -gt 0) {
        Write-Host "✅ 菜单数据已保存！当前菜单数量: $($menusCheck.Count)" -ForegroundColor Green
        $menusCheck | ForEach-Object {
            Write-Host "   - ID: $($_.id), 名称: $($_.name)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ 菜单列表为空" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "4.2 检查卡片列表..." -ForegroundColor Cyan
    if ($menuId) {
        $cardsCheck = Invoke-RestMethod -Uri "$baseUrl/cards/$menuId" -Method Get
        
        if ($cardsCheck.Count -gt 0) {
            Write-Host "✅ 卡片数据已保存！当前卡片数量: $($cardsCheck.Count)" -ForegroundColor Green
            $cardsCheck | ForEach-Object {
                Write-Host "   - ID: $($_.id), 标题: $($_.title), URL: $($_.url)" -ForegroundColor Gray
            }
        } else {
            Write-Host "❌ 卡片列表为空" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ 验证失败：$($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan

# 步骤 5: 测试数据持久化（等待后再次查询）
Write-Host ""
Write-Host "步骤 5: 测试数据持久化..." -ForegroundColor Yellow
Write-Host "等待 5 秒后再次查询，验证数据是否持久化..." -ForegroundColor Gray

Start-Sleep -Seconds 5

try {
    $menusCheck2 = Invoke-RestMethod -Uri "$baseUrl/menus" -Method Get
    
    if ($menusCheck2.Count -gt 0) {
        Write-Host "✅ 数据持久化成功！菜单仍然存在" -ForegroundColor Green
        Write-Host "   菜单数量: $($menusCheck2.Count)" -ForegroundColor Gray
    } else {
        Write-Host "❌ 数据未持久化！菜单消失了" -ForegroundColor Red
        Write-Host "   这可能意味着正在使用内存数据库" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ 持久化验证失败：$($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 测试总结" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ 测试完成！" -ForegroundColor Green
Write-Host ""
Write-Host "下一步操作：" -ForegroundColor Yellow
Write-Host "1. 访问网站首页验证数据是否显示" -ForegroundColor White
Write-Host "2. 如果数据显示正常，说明数据库写入功能正常" -ForegroundColor White
Write-Host "3. 如果数据不显示，检查浏览器控制台的错误信息" -ForegroundColor White
Write-Host ""
Write-Host "网站地址: https://nav-vercel-eight.vercel.app/" -ForegroundColor Cyan
Write-Host ""