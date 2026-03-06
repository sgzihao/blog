#!/bin/bash
# deploy.sh - One-click deployment script (no R2)
# Usage: ./deploy.sh [api|frontend|all]

set -e

COLOR_GREEN='\033[0;32m'
COLOR_CYAN='\033[0;36m'
COLOR_RED='\033[0;31m'
COLOR_RESET='\033[0m'

log() { echo -e "${COLOR_CYAN}▶ $1${COLOR_RESET}"; }
success() { echo -e "${COLOR_GREEN}✓ $1${COLOR_RESET}"; }
error() { echo -e "${COLOR_RED}✗ $1${COLOR_RESET}"; exit 1; }

# Project name for Cloudflare Pages deployment (change to your project name)
PAGES_PROJECT=${PAGES_PROJECT:-"techblog"}

TARGET=${1:-all}

deploy_api() {
  log "Deploying Workers API..."
  cd api
  npm install
  npx wrangler deploy
  success "API deployment complete"
  cd ..
}

deploy_frontend() {
  log "Building and deploying frontend..."
  cd frontend
  npm install

  if [ ! -f .env ]; then
    error ".env file not found. Please copy from .env.example and fill in values"
  fi

  API_URL_RAW=$(grep '^PUBLIC_API_URL=' .env | head -n1 | cut -d= -f2- | tr -d '"' | tr -d "'")
  if [ -z "$API_URL_RAW" ]; then
    error "PUBLIC_API_URL is missing in .env"
  fi

  if [[ "$API_URL_RAW" =~ ^https?:// ]]; then
    export PUBLIC_API_URL="${API_URL_RAW%/}"
  elif [[ "$API_URL_RAW" =~ ^(localhost|127\.0\.0\.1) ]]; then
    export PUBLIC_API_URL="http://${API_URL_RAW%/}"
    log "Detected local API address, auto-completed to: $PUBLIC_API_URL"
  else
    export PUBLIC_API_URL="https://${API_URL_RAW%/}"
    log "Detected missing protocol, auto-completed to: $PUBLIC_API_URL"
  fi

  npm run build
  npx wrangler pages deploy ./dist --project-name="$PAGES_PROJECT"
  success "Frontend deployment complete"
  cd ..
}

init_db() {
  log "Initializing database..."
  cd api
  npx wrangler d1 execute techblog-db --remote --file=./schema.sql
  success "Database initialization complete"
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
success "Deployment complete!"
