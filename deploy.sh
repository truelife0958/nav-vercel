#!/bin/bash

# Nav Pro Vercel 快速部署脚本
# 作者: marry
# 用途: 一键部署到 Vercel

set -e

echo "🚀 Nav Pro Vercel 部署脚本"
echo "=========================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    echo "请访问 https://nodejs.org 下载安装"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未安装 npm"
    exit 1
fi

echo "✅ npm 版本: $(npm -v)"
echo ""

# 检查 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI 已安装"
echo ""

# 询问部署类型
echo "请选择部署类型:"
echo "1) 开发预览 (Development)"
echo "2) 生产部署 (Production)"
read -p "请输入选项 (1 或 2): " deploy_type

echo ""

case $deploy_type in
    1)
        echo "📦 部署到开发环境..."
        vercel
        ;;
    2)
        echo "🚀 部署到生产环境..."
        vercel --prod
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

echo ""
echo "✅ 部署完成！"
echo ""
echo "📝 提示:"
echo "  - 访问 https://vercel.com/dashboard 查看部署详情"
echo "  - 首次部署需要登录 Vercel 账号"
echo "  - 生产环境域名会自动生成"
echo ""
