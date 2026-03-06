#!/bin/bash
# =============================================================================
# dev.sh — TechBlog Local Development Launcher (zero-to-running)
# Auto-detects and installs: Node.js -> Wrangler -> Dependencies -> Local DB -> Services
#
# Supported systems: macOS, Linux (Ubuntu/Debian/CentOS)
#
# Usage:
#   bash dev.sh          # First run: auto-install + start
#   bash dev.sh --reset  # Reset local database (keeps installed tools, clears data)
#   bash dev.sh --stop   # Stop all background services
# =============================================================================

set -e

# ==================== Color Output ====================
CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'

log()     { echo -e "${CYAN}  ▶ $1${RESET}"; }
success() { echo -e "${GREEN}  ✓ $1${RESET}"; }
warn()    { echo -e "${YELLOW}  ⚠ $1${RESET}"; }
error()   { echo -e "${RED}  ✗ Error: $1${RESET}"; echo ""; exit 1; }
header()  { echo -e "\n${BOLD}${CYAN}$1${RESET}"; echo -e "${CYAN}$(printf '%.0s─' {1..50})${RESET}"; }

# ==================== Paths ====================
PID_DIR=".dev-pids"
LOG_DIR=".dev-logs"
API_PID="$PID_DIR/api.pid"
FRONT_PID="$PID_DIR/frontend.pid"

# ==================== Stop Services ====================
stop_services() {
  echo ""
  log "Stopping all services..."
  [ -f "$API_PID" ]   && kill "$(cat $API_PID)"   2>/dev/null && rm -f "$API_PID"   || true
  [ -f "$FRONT_PID" ] && kill "$(cat $FRONT_PID)" 2>/dev/null && rm -f "$FRONT_PID" || true
  lsof -ti:8787 2>/dev/null | xargs kill -9 2>/dev/null || true
  lsof -ti:4321 2>/dev/null | xargs kill -9 2>/dev/null || true
  success "Services stopped"
  exit 0
}

[ "$1" = "--stop" ] && stop_services

# ==================== Welcome Screen ====================
clear
echo ""
echo -e "${BOLD}${CYAN}"
echo "  ╔════════════════════════════════════════════╗"
echo "  ║       TechBlog  Local Preview Launcher     ║"
echo "  ║       Tech & AI Knowledge Base             ║"
echo "  ╚════════════════════════════════════════════╝"
echo -e "${RESET}"
echo -e "  ${YELLOW}D1 / R2 fully simulated locally, no Cloudflare account needed${RESET}"
echo ""

# ==================== Detect OS ====================
OS=""
PKG=""
if [[ "$OSTYPE" == "darwin"* ]]; then
  OS="macos"
elif [[ -f /etc/debian_version ]]; then
  OS="debian"   # Ubuntu / Debian
elif [[ -f /etc/redhat-release ]]; then
  OS="redhat"   # CentOS / RHEL / Fedora
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  OS="linux"
else
  error "Unsupported operating system: $OSTYPE"
fi

# ==================== Step 1: Install Node.js ====================
header "[ 1/5 ] Checking Node.js environment"

install_node_macos() {
  log "Installing Node.js via Homebrew..."
  if ! command -v brew &>/dev/null; then
    log "Homebrew not found, installing (may require password)..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    # Add brew to current shell PATH
    if [[ -f "/opt/homebrew/bin/brew" ]]; then
      eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    success "Homebrew installed"
  fi
  brew install node
  success "Node.js installed"
}

install_node_nvm() {
  # Install via nvm (works on all Linux distros)
  log "Installing nvm (Node.js version manager)..."
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

  # Load nvm into current shell
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

  log "Installing Node.js LTS..."
  nvm install --lts
  nvm use --lts
  success "Node.js installed (via nvm)"
}

install_node_debian() {
  log "Installing Node.js 20 via apt..."
  # Add NodeSource official repository (Node 20 LTS)
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  success "Node.js installed"
}

install_node_redhat() {
  log "Installing Node.js 20 via dnf/yum..."
  curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
  if command -v dnf &>/dev/null; then
    sudo dnf install -y nodejs
  else
    sudo yum install -y nodejs
  fi
  success "Node.js installed"
}

# Check if Node.js is installed
if command -v node &>/dev/null; then
  NODE_VER=$(node -v)
  # Check version >= 18
  NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)
  if [ "$NODE_MAJOR" -lt 18 ]; then
    warn "Node.js $NODE_VER is too old (18+ required), upgrading..."
    case $OS in
      macos)  install_node_macos ;;
      debian) install_node_debian ;;
      redhat) install_node_redhat ;;
      *)      install_node_nvm ;;
    esac
  else
    success "Node.js $NODE_VER ✓"
  fi
else
  warn "Node.js not found, starting automatic installation..."
  case $OS in
    macos)  install_node_macos ;;
    debian) install_node_debian ;;
    redhat) install_node_redhat ;;
    *)      install_node_nvm ;;
  esac
fi

# Reload PATH (needed after nvm install)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Final verification
if ! command -v node &>/dev/null; then
  error "Node.js installation failed. Please install manually: https://nodejs.org"
fi
success "Node.js $(node -v)"
success "npm $(npm -v)"

# ==================== Step 2: Install Wrangler ====================
header "[ 2/5 ] Checking Wrangler CLI"

if ! command -v wrangler &>/dev/null; then
  log "Installing Wrangler CLI globally..."
  npm install -g wrangler 2>&1 | tail -3
  # Some environments need PATH refresh
  export PATH="$PATH:$(npm root -g)/../bin"
  if ! command -v wrangler &>/dev/null; then
    # Try npx as fallback
    warn "Global wrangler command not available, will use npx wrangler"
    WRANGLER_CMD="npx wrangler"
  else
    WRANGLER_CMD="wrangler"
    success "Wrangler $(wrangler --version 2>/dev/null | head -1)"
  fi
else
  WRANGLER_CMD="wrangler"
  success "Wrangler $(wrangler --version 2>/dev/null | head -1) ✓"
fi

# ==================== Step 3: Install Project Dependencies ====================
header "[ 3/5 ] Installing project dependencies"

# Check if in project root
if [ ! -d "api" ] || [ ! -d "frontend" ]; then
  error "Please run this script from the techblog/ root directory (current: $(pwd))"
fi

log "Installing API dependencies..."
(cd api && npm install --prefer-offline --silent) && success "API dependencies installed"

log "Installing frontend dependencies..."
(cd frontend && npm install --prefer-offline --silent) && success "Frontend dependencies installed"

# Configure frontend local environment variables
if [ ! -f "frontend/.env" ]; then
  cp frontend/.env.local frontend/.env
  success "Local .env generated (pre-configured, no manual edits needed)"
else
  success "Frontend .env already exists"
fi

# ==================== Step 4: Initialize Database ====================
header "[ 4/5 ] Initializing local database"

DB_DIR="api/.wrangler/state/v3/d1"

if [ "$1" = "--reset" ]; then
  log "Resetting database..."
  rm -rf api/.wrangler/state
  success "Old data cleared"
fi

if [ ! -d "$DB_DIR" ]; then
  log "Initializing local D1 database (with sample articles)..."
  (
    cd api
    $WRANGLER_CMD d1 execute techblog-db \
      --config wrangler.dev.toml \
      --local \
      --file=./schema.sql 2>&1 | grep -E "^(✓|Error|Warning)" || true
  )
  success "Database initialization complete"
else
  success "Database already exists (skip. To reset run: bash dev.sh --reset)"
fi

# ==================== Step 5: Start Services ====================
header "[ 5/5 ] Starting local services"

mkdir -p "$PID_DIR" "$LOG_DIR"

# Clean up occupied ports
for PORT in 8787 4321; do
  if lsof -ti:$PORT &>/dev/null; then
    warn "Port $PORT is in use, releasing..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
done

# Start Workers API
log "Starting Workers API (:8787)..."
(
  cd api
  $WRANGLER_CMD dev \
    --config wrangler.dev.toml \
    --local \
    --port 8787 \
    --log-level error \
    >> "../$LOG_DIR/api.log" 2>&1
) &
echo $! > "$API_PID"

# Wait for API to be ready
echo -ne "  ${CYAN}Waiting for API${RESET}"
API_READY=0
for i in $(seq 1 30); do
  sleep 1; echo -ne "."
  if curl -sf http://localhost:8787/ &>/dev/null; then
    API_READY=1; break
  fi
done
echo ""
if [ $API_READY -eq 1 ]; then
  success "API ready -> http://localhost:8787"
else
  warn "API is slow to start, still waiting... (check logs: $LOG_DIR/api.log)"
fi

# Start Astro frontend
log "Starting Astro frontend (:4321)..."
(
  cd frontend
  npm run dev -- --port 4321 --host 0.0.0.0 \
    >> "../$LOG_DIR/frontend.log" 2>&1
) &
echo $! > "$FRONT_PID"

# Wait for frontend to be ready
echo -ne "  ${CYAN}Waiting for frontend${RESET}"
FRONT_READY=0
for i in $(seq 1 40); do
  sleep 1; echo -ne "."
  if curl -sf http://localhost:4321/ &>/dev/null; then
    FRONT_READY=1; break
  fi
done
echo ""
if [ $FRONT_READY -eq 1 ]; then
  success "Frontend ready -> http://localhost:4321"
else
  warn "Frontend is slow to start, please wait or check logs: $LOG_DIR/frontend.log"
fi

# ==================== Startup Complete ====================
echo ""
echo -e "${BOLD}${GREEN}  ╔════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GREEN}  ║         Local preview is ready!            ║${RESET}"
echo -e "${BOLD}${GREEN}  ╚════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  Website    ->  ${CYAN}http://localhost:4321${RESET}"
echo -e "  Admin      ->  ${CYAN}http://localhost:4321/admin${RESET}"
echo -e "  API        ->  ${CYAN}http://localhost:8787${RESET}"
echo ""
echo -e "  Admin password  ->  ${YELLOW}dev-token-123${RESET}"
echo ""
echo -e "  Local data storage:"
echo -e "       Database  ->  api/.wrangler/state/v3/d1/"
echo -e "       Images    ->  api/.wrangler/state/v3/r2/"
echo -e "       Logs      ->  .dev-logs/"
echo ""
echo -e "  Commands:"
echo -e "       Stop services   ->  ${YELLOW}bash dev.sh --stop${RESET}"
echo -e "       Reset data      ->  ${YELLOW}bash dev.sh --reset${RESET}"
echo ""
echo -e "  ${CYAN}Press Ctrl+C to stop all services${RESET}"
echo ""

# Auto-open browser
if command -v open &>/dev/null; then
  open http://localhost:4321 2>/dev/null || true
elif command -v xdg-open &>/dev/null; then
  xdg-open http://localhost:4321 2>/dev/null || true
fi

# Trap exit signals
trap stop_services INT TERM

# Follow log output in real-time
tail -f "$LOG_DIR/api.log" "$LOG_DIR/frontend.log" 2>/dev/null &
wait
