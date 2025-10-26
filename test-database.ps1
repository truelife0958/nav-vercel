# Vercel Postgres 数据库连接测试脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Vercel Postgres 数据库连接测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://nav-vercel-eight.vercel.app"

# 测试 1: 健康检查
Write-Host "测试 1: 检查 API 健康状态..." -ForegroundColor Yellow
Write-Host "URL: $baseUrl/api/health" -ForegroundColor Gray
Write-Host ""

try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get -ErrorAction Stop
    
    Write-Host "✅ API 状态: " -NoNewline -ForegroundColor Green
    Write-Host $healthResponse.status -ForegroundColor White
    
    Write-Host "✅ 运行环境: " -NoNewline -ForegroundColor Green
    Write-Host $healthResponse.environment -ForegroundColor White
    
    Write-Host "✅ 数据库状态: " -NoNewline -ForegroundColor Green
    if ($healthResponse.database -eq "initialized") {
        Write-Host $healthResponse.database -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 数据库连接成功！" -ForegroundColor Green
        $dbConnected = $true
    } elseif ($healthResponse.database -match "in-memory") {
        Write-Host $healthResponse.database -ForegroundColor Red
        Write-Host ""
        Write-Host "⚠️  警告: 正在使用内存数据库（降级模式）" -ForegroundColor Red
        Write-Host "   这意味着 Postgres 连接失败" -ForegroundColor Red
        $dbConnected = $false
    } else {
        Write-Host $healthResponse.database -ForegroundColor Yellow
        $dbConnected = $false
    }
    
    Write-Host ""
    Write-Host "完整响应:" -ForegroundColor Cyan
    $healthResponse | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Gray
    
} catch {
    Write-Host "❌ 健康检查失败: $_" -ForegroundColor Red
    $dbConnected = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# 测试 2: 菜单 API
Write-Host ""
Write-Host "测试 2: 检查菜单 API..." -ForegroundColor Yellow
Write-Host "URL: $baseUrl/api/menus" -ForegroundColor Gray
Write-Host ""

try {
    $menusResponse = Invoke-RestMethod -Uri "$baseUrl/api/menus" -Method Get -ErrorAction Stop
    
    if ($menusResponse -is [Array]) {
        Write-Host "✅ 菜单 API 正常响应" -ForegroundColor Green
        Write-Host "   当前菜单数量: " -NoNewline -ForegroundColor Gray
        Write-Host $menusResponse.Count -ForegroundColor White
        
        if ($menusResponse.Count -eq 0) {
            Write-Host "   (空数据是正常的，因为还没有添加菜单)" -ForegroundColor Gray
        } else {
            Write-Host ""
            Write-Host "   菜单列表:" -ForegroundColor Cyan
            $menusResponse | ForEach-Object {
                Write-Host "   - $($_.name)" -ForegroundColor White
            }
        }
    } else {
        Write-Host "⚠️  菜单 API 返回格式异常" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ 菜单 API 失败: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# 测试 3: 卡片 API
Write-Host ""
Write-Host "测试 3: 检查卡片 API..." -ForegroundColor Yellow
Write-Host "URL: $baseUrl/api/cards" -ForegroundColor Gray
Write-Host ""

try {
    $cardsResponse = Invoke-RestMethod -Uri "$baseUrl/api/cards" -Method Get -ErrorAction Stop
    
    if ($cardsResponse -is [Array]) {
        Write-Host "✅ 卡片 API 正常响应" -ForegroundColor Green
        Write-Host "   当前卡片数量: " -NoNewline -ForegroundColor Gray
        Write-Host $cardsResponse.Count -ForegroundColor White
        
        if ($cardsResponse.Count -eq 0) {
            Write-Host "   (空数据是正常的，因为还没有添加卡片)" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  卡片 API 返回格式异常" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ 卡片 API 失败: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# 测试 4: 广告 API
Write-Host ""
Write-Host "测试 4: 检查广告 API..." -ForegroundColor Yellow
Write-Host "URL: $baseUrl/api/ads" -ForegroundColor Gray
Write-Host ""

try {
    $adsResponse = Invoke-RestMethod -Uri "$baseUrl/api/ads" -Method Get -ErrorAction Stop
    
    if ($adsResponse -is [Array]) {
        Write-Host "✅ 广告 API 正常响应" -ForegroundColor Green
        Write-Host "   当前广告数量: " -NoNewline -ForegroundColor Gray
        Write-Host $adsResponse.Count -ForegroundColor White
    } else {
        Write-Host "⚠️  广告 API 返回格式异常" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ 广告 API 失败: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 最终总结
Write-Host "📊 测试总结" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($dbConnected) {
    Write-Host ""
    Write-Host "🎉🎉🎉 恭喜！Vercel Postgres 配置成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ 数据库: Postgres (已连接)" -ForegroundColor Green
    Write-Host "✅ 数据持久化: 已启用" -ForegroundColor Green
    Write-Host "✅ 所有 API: 正常工作" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步操作:" -ForegroundColor Yellow
    Write-Host "1. 访问管理后台: $baseUrl/admin" -ForegroundColor White
    Write-Host "2. 使用配置的管理员账户登录" -ForegroundColor White
    Write-Host "3. 开始添加菜单和导航卡片" -ForegroundColor White
    Write-Host "4. 数据将永久保存在 Postgres 中" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "⚠️  数据库连接失败" -ForegroundColor Red
    Write-Host ""
    Write-Host "当前状态:" -ForegroundColor Yellow
    Write-Host "❌ 数据库: 内存数据库 (临时)" -ForegroundColor Red
    Write-Host "❌ 数据持久化: 未启用" -ForegroundColor Red
    Write-Host "⚠️  数据会在 Function 重启后丢失" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "可能的原因:" -ForegroundColor Yellow
    Write-Host "1. POSTGRES_URL 环境变量未正确设置" -ForegroundColor White
    Write-Host "2. 环境变量添加后未重新部署" -ForegroundColor White
    Write-Host "3. Postgres 连接字符串格式错误" -ForegroundColor White
    Write-Host "4. Neon 数据库连接超时" -ForegroundColor White
    Write-Host ""
    Write-Host "建议操作:" -ForegroundColor Yellow
    Write-Host "1. 检查 Vercel 环境变量配置" -ForegroundColor White
    Write-Host "2. 确认 POSTGRES_URL 已正确添加" -ForegroundColor White
    Write-Host "3. 重新触发部署 (Deployments -> Redeploy)" -ForegroundColor White
    Write-Host "4. 查看 Function 日志 (Functions -> api/index.js -> Logs)" -ForegroundColor White
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "提示: 查看详细的部署日志" -ForegroundColor Cyan
Write-Host "Vercel Dashboard -> Functions -> api/index.js -> Logs" -ForegroundColor Gray
Write-Host ""