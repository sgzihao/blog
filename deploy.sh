#!/bin/bash
# deploy.sh - 一键部署脚本（无 R2 版本）
# 使用方法: ./deploy.sh [api|frontend|all]

set -e

COLOR_GREEN='\033[0;32m'
COLOR_CYAN='\033[0;36m'
COLOR_RED='\033[0;31m'
COLOR_RESET='\033[0m'

log() { echo -e "${COLOR_CYAN}▶ $1${COLOR_RESET}"; }
success() { echo -e "${COLOR_GREEN}✓ $1${COLOR_RESET}"; }
error() { echo -e "${COLOR_RED}✗ $1${COLOR_RESET}"; exit 1; }

TARGET=${1:-all}

deploy_api() {
  log "部署 Workers API..."
  cd api
  npm install
  npx wrangler deploy
  success "API 部署完成"
  cd ..
}

deploy_frontend() {
  log "构建并部署前端..."
  cd frontend
  npm install

  if [ ! -f .env ]; then
    error ".env 文件不存在，请先从 .env.example 复制并填写"
  fi

  API_URL_RAW=$(grep '^PUBLIC_API_URL=' .env | head -n1 | cut -d= -f2- | tr -d '"' | tr -d "'")
  if [ -z "$API_URL_RAW" ]; then
    error ".env 中缺少 PUBLIC_API_URL"
  fi

  if [[ "$API_URL_RAW" =~ ^https?:// ]]; then
    export PUBLIC_API_URL="${API_URL_RAW%/}"
  elif [[ "$API_URL_RAW" =~ ^(localhost|127\.0\.0\.1) ]]; then
    export PUBLIC_API_URL="http://${API_URL_RAW%/}"
    log "检测到本地 API 地址，已自动补全为: $PUBLIC_API_URL"
  else
    export PUBLIC_API_URL="https://${API_URL_RAW%/}"
    log "检测到缺少协议，已自动补全为: $PUBLIC_API_URL"
  fi

  npm run build
  npx wrangler pages deploy ./dist --project-name=techblog
  success "前端部署完成"
  cd ..
}

init_db() {
  log "初始化数据库..."
  cd api
  npx wrangler d1 execute techblog-db --remote --file=./schema.sql
  success "数据库初始化完成"
  cd ..
}

case $TARGET in
  api)      deploy_api ;;
  frontend) deploy_frontend ;;
  db)       init_db ;;
  all)
    deploy_api
    init_db
    deploy_frontend
    ;;
  *)
    echo "Usage: $0 [api|frontend|db|all]"
    exit 1
    ;;
esac

echo ""
success "🚀 部署完成！"
