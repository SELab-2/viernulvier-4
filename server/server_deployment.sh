#!/bin/bash

# =============================================================================
# Deployment script for backend and frontend
# Run from the project root: bash server/server_deployment.sh
# =============================================================================

set -e  # Exit immediately on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log()    { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn()   { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# =============================================================================
# Pre-flight checks
# =============================================================================

log "Running pre-flight checks..."

# Check we're in the project root
if [ ! -f "ecosystem.config.js" ]; then
  error "ecosystem.config.js not found. Are you running this from the project root?"
fi

# Check .env exists
if [ ! -f ".env" ]; then
  error ".env file not found. Copy .env.example to .env and fill in your values before deploying."
fi

# Check required tools
for tool in npm pm2 node; do
  if ! command -v $tool &> /dev/null; then
    error "$tool is not installed or not in PATH."
  fi
done

log "Pre-flight checks passed."

# =============================================================================
# Backend
# =============================================================================

log "Building backend..."

cd backend

if [ ! -d "node_modules" ]; then
  log "Installing backend dependencies..."
  npm install
else
  log "Backend dependencies already installed, skipping."
fi

npm run build || error "Backend build failed."

cd ..
log "Backend built successfully."

# =============================================================================
# Frontend
# =============================================================================

log "Building frontend..."

cd frontend

if [ ! -d "node_modules" ]; then
  log "Installing frontend dependencies..."
  npm install
else
  log "Frontend dependencies already installed, skipping."
fi

npm run build || error "Frontend build failed."

cd ..
log "Frontend built successfully."

# =============================================================================
# Deploy with pm2
# =============================================================================

log "Deploying with pm2..."

# If already running, reload — otherwise start fresh
if pm2 list | grep -q "backend\|frontend"; then
  log "Existing pm2 processes found, reloading..."
  pm2 reload ecosystem.config.js --update-env
else
  log "No existing pm2 processes found, starting..."
  pm2 start ecosystem.config.js
fi

# Save pm2 process list so it survives reboots
pm2 save

log "Deployment complete."
pm2 list

# =============================================================================
# Optional: reload Nginx
# =============================================================================

if command -v nginx &> /dev/null; then
  log "Testing Nginx config..."
  if sudo nginx -t; then
    log "Reloading Nginx..."
    sudo systemctl reload nginx
  else
    warn "Nginx config test failed — skipping reload. Check your config manually."
  fi
else
  warn "Nginx not found — skipping reload."
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment finished successfully!     ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""