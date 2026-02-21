#!/bin/bash
# =============================================================================
# dev.sh — TechBlog 本地一键启动脚本（从零开始版）
# 自动检测并安装：Node.js → Wrangler → 项目依赖 → 本地数据库 → 启动服务
#
# 支持系统：macOS、Linux（Ubuntu/Debian/CentOS）
#
# 用法：
#   bash dev.sh          # 首次运行，全自动安装 + 启动
#   bash dev.sh --reset  # 重置本地数据库（保留安装，清空数据）
#   bash dev.sh --stop   # 停止所有后台服务
# =============================================================================

set -e

# ==================== 颜色输出 ====================
CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'

log()     { echo -e "${CYAN}  ▶ $1${RESET}"; }
success() { echo -e "${GREEN}  ✓ $1${RESET}"; }
warn()    { echo -e "${YELLOW}  ⚠ $1${RESET}"; }
error()   { echo -e "${RED}  ✗ 错误：$1${RESET}"; echo ""; exit 1; }
header()  { echo -e "\n${BOLD}${CYAN}$1${RESET}"; echo -e "${CYAN}$(printf '%.0s─' {1..50})${RESET}"; }

# ==================== 路径 ====================
PID_DIR=".dev-pids"
LOG_DIR=".dev-logs"
API_PID="$PID_DIR/api.pid"
FRONT_PID="$PID_DIR/frontend.pid"

# ==================== 停止服务 ====================
stop_services() {
  echo ""
  log "正在停止所有服务..."
  [ -f "$API_PID" ]   && kill "$(cat $API_PID)"   2>/dev/null && rm -f "$API_PID"   || true
  [ -f "$FRONT_PID" ] && kill "$(cat $FRONT_PID)" 2>/dev/null && rm -f "$FRONT_PID" || true
  lsof -ti:8787 2>/dev/null | xargs kill -9 2>/dev/null || true
  lsof -ti:4321 2>/dev/null | xargs kill -9 2>/dev/null || true
  success "服务已停止"
  exit 0
}

[ "$1" = "--stop" ] && stop_services

# ==================== 欢迎界面 ====================
clear
echo ""
echo -e "${BOLD}${CYAN}"
echo "  ╔════════════════════════════════════════════╗"
echo "  ║       TechBlog  本地预览启动器             ║"
echo "  ║       科技 AI 个人知识库                   ║"
echo "  ╚════════════════════════════════════════════╝"
echo -e "${RESET}"
echo -e "  ${YELLOW}D1 / R2 全部本地模拟，完全无需 Cloudflare 账号${RESET}"
echo ""

# ==================== 检测操作系统 ====================
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
  error "不支持的操作系统：$OSTYPE"
fi

# ==================== 第一步：安装 Node.js ====================
header "[ 1/5 ] 检查 Node.js 环境"

install_node_macos() {
  log "正在通过 Homebrew 安装 Node.js..."
  if ! command -v brew &>/dev/null; then
    log "未找到 Homebrew，正在安装（需要输入密码）..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    # 将 brew 加入当前 shell 路径
    if [[ -f "/opt/homebrew/bin/brew" ]]; then
      eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    success "Homebrew 安装完成"
  fi
  brew install node
  success "Node.js 安装完成"
}

install_node_nvm() {
  # 通过 nvm 安装（适用于所有 Linux）
  log "正在安装 nvm（Node.js 版本管理器）..."
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

  # 加载 nvm 到当前 shell
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

  log "正在安装 Node.js LTS..."
  nvm install --lts
  nvm use --lts
  success "Node.js 安装完成（通过 nvm）"
}

install_node_debian() {
  log "正在通过 apt 安装 Node.js 20..."
  # 添加 NodeSource 官方仓库（Node 20 LTS）
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  success "Node.js 安装完成"
}

install_node_redhat() {
  log "正在通过 dnf/yum 安装 Node.js 20..."
  curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
  if command -v dnf &>/dev/null; then
    sudo dnf install -y nodejs
  else
    sudo yum install -y nodejs
  fi
  success "Node.js 安装完成"
}

# 检查 Node.js 是否已安装
if command -v node &>/dev/null; then
  NODE_VER=$(node -v)
  # 检查版本是否 >= 18
  NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)
  if [ "$NODE_MAJOR" -lt 18 ]; then
    warn "Node.js $NODE_VER 版本过低（需要 18+），正在升级..."
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
  warn "未找到 Node.js，开始自动安装..."
  case $OS in
    macos)  install_node_macos ;;
    debian) install_node_debian ;;
    redhat) install_node_redhat ;;
    *)      install_node_nvm ;;
  esac
fi

# 重新加载 PATH（nvm 安装后需要）
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 最终验证
if ! command -v node &>/dev/null; then
  error "Node.js 安装失败，请手动安装后重试：https://nodejs.org"
fi
success "Node.js $(node -v)"
success "npm $(npm -v)"

# ==================== 第二步：安装 Wrangler ====================
header "[ 2/5 ] 检查 Wrangler CLI"

if ! command -v wrangler &>/dev/null; then
  log "正在全局安装 Wrangler CLI..."
  npm install -g wrangler 2>&1 | tail -3
  # 某些环境需要刷新 PATH
  export PATH="$PATH:$(npm root -g)/../bin"
  if ! command -v wrangler &>/dev/null; then
    # 尝试用 npx 作为备用
    warn "全局 wrangler 命令不可用，将使用 npx wrangler"
    WRANGLER_CMD="npx wrangler"
  else
    WRANGLER_CMD="wrangler"
    success "Wrangler $(wrangler --version 2>/dev/null | head -1)"
  fi
else
  WRANGLER_CMD="wrangler"
  success "Wrangler $(wrangler --version 2>/dev/null | head -1) ✓"
fi

# ==================== 第三步：安装项目依赖 ====================
header "[ 3/5 ] 安装项目依赖"

# 检查是否在项目根目录
if [ ! -d "api" ] || [ ! -d "frontend" ]; then
  error "请在 techblog/ 根目录下运行此脚本（当前目录：$(pwd)）"
fi

log "安装 API 依赖..."
(cd api && npm install --prefer-offline --silent) && success "API 依赖安装完成"

log "安装前端依赖..."
(cd frontend && npm install --prefer-offline --silent) && success "前端依赖安装完成"

# 配置前端本地环境变量
if [ ! -f "frontend/.env" ]; then
  cp frontend/.env.local frontend/.env
  success "本地 .env 已生成（预配置完毕，无需手动修改）"
else
  success "前端 .env 已存在"
fi

# ==================== 第四步：初始化数据库 ====================
header "[ 4/5 ] 初始化本地数据库"

DB_DIR="api/.wrangler/state/v3/d1"

if [ "$1" = "--reset" ]; then
  log "正在重置数据库..."
  rm -rf api/.wrangler/state
  success "已清除旧数据"
fi

if [ ! -d "$DB_DIR" ]; then
  log "初始化 D1 本地数据库（含示例文章）..."
  (
    cd api
    $WRANGLER_CMD d1 execute techblog-db \
      --config wrangler.dev.toml \
      --local \
      --file=./schema.sql 2>&1 | grep -E "^(✓|Error|Warning)" || true
  )
  success "数据库初始化完成"
else
  success "数据库已存在（跳过。如需重置请运行：bash dev.sh --reset）"
fi

# ==================== 第五步：启动服务 ====================
header "[ 5/5 ] 启动本地服务"

mkdir -p "$PID_DIR" "$LOG_DIR"

# 清理旧的端口占用
for PORT in 8787 4321; do
  if lsof -ti:$PORT &>/dev/null; then
    warn "端口 $PORT 已被占用，正在释放..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
done

# 启动 Workers API
log "启动 Workers API（:8787）..."
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

# 等待 API 就绪
echo -ne "  ${CYAN}等待 API 就绪${RESET}"
API_READY=0
for i in $(seq 1 30); do
  sleep 1; echo -ne "."
  if curl -sf http://localhost:8787/ &>/dev/null; then
    API_READY=1; break
  fi
done
echo ""
if [ $API_READY -eq 1 ]; then
  success "API 已就绪 → http://localhost:8787"
else
  warn "API 启动较慢，继续等待...（可查看日志：$LOG_DIR/api.log）"
fi

# 启动 Astro 前端
log "启动 Astro 前端（:4321）..."
(
  cd frontend
  npm run dev -- --port 4321 --host 0.0.0.0 \
    >> "../$LOG_DIR/frontend.log" 2>&1
) &
echo $! > "$FRONT_PID"

# 等待前端就绪
echo -ne "  ${CYAN}等待前端就绪${RESET}"
FRONT_READY=0
for i in $(seq 1 40); do
  sleep 1; echo -ne "."
  if curl -sf http://localhost:4321/ &>/dev/null; then
    FRONT_READY=1; break
  fi
done
echo ""
if [ $FRONT_READY -eq 1 ]; then
  success "前端已就绪 → http://localhost:4321"
else
  warn "前端启动较慢，请稍等或查看日志：$LOG_DIR/frontend.log"
fi

# ==================== 启动完成 ====================
echo ""
echo -e "${BOLD}${GREEN}  ╔════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GREEN}  ║         🚀  本地预览已就绪！               ║${RESET}"
echo -e "${BOLD}${GREEN}  ╚════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  🌐  ${BOLD}网站首页${RESET}   →  ${CYAN}http://localhost:4321${RESET}"
echo -e "  🔧  ${BOLD}管理后台${RESET}   →  ${CYAN}http://localhost:4321/admin${RESET}"
echo -e "  🔌  ${BOLD}API 接口${RESET}   →  ${CYAN}http://localhost:8787${RESET}"
echo ""
echo -e "  🔑  ${BOLD}管理密码${RESET}   →  ${YELLOW}dev-token-123${RESET}"
echo ""
echo -e "  📂  本地数据存储位置："
echo -e "       数据库  →  api/.wrangler/state/v3/d1/"
echo -e "       图片    →  api/.wrangler/state/v3/r2/"
echo -e "       日志    →  .dev-logs/"
echo ""
echo -e "  ⌨️   常用命令："
echo -e "       停止服务  →  ${YELLOW}bash dev.sh --stop${RESET}"
echo -e "       重置数据  →  ${YELLOW}bash dev.sh --reset${RESET}"
echo ""
echo -e "  ${CYAN}按 Ctrl+C 可停止所有服务${RESET}"
echo ""

# 自动打开浏览器
if command -v open &>/dev/null; then
  open http://localhost:4321 2>/dev/null || true
elif command -v xdg-open &>/dev/null; then
  xdg-open http://localhost:4321 2>/dev/null || true
fi

# 捕获退出信号
trap stop_services INT TERM

# 实时跟踪日志输出
tail -f "$LOG_DIR/api.log" "$LOG_DIR/frontend.log" 2>/dev/null &
wait
