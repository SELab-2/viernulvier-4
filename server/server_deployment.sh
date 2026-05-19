#!/bin/bash

# =============================================================================
# Deployment script for backend and frontend
# Run from the project root: bash server/server_deployment.sh [--init-db]
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
# Argument Parsing
# =============================================================================

INIT_DB=false

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --init-db) INIT_DB=true ;;
    *) warn "Unknown parameter passed: $1"; exit 1 ;;
  esac
  shift
done

# =============================================================================
# Database Initialization (Optional)
# =============================================================================

if [ "$INIT_DB" = true ]; then
  log "Database initialization requested."

  # 1. Check if psql is installed before we do anything else
  if ! command -v psql &> /dev/null; then
    error "psql command not found. Please install PostgreSQL client tools before initializing the DB."
  fi

  # Hardcoded path to the dump file
  dump_file="server/database/pg.dump"

  if [ ! -f "$dump_file" ]; then
    error "Dump file not found at '$dump_file'. Ensure you are running this from the project root."
  fi

  read -p "Enter PostgreSQL username (e.g., postgres): " db_user
  read -s -p "Enter PostgreSQL password: " db_pass
  echo "" # Add newline after silent password prompt
  read -p "Enter Database name to create: " db_name

  log "Connecting to PostgreSQL to setup database..."

  export PGPASSWORD="$db_pass"

  # 2. Check if the PostgreSQL server is actually running and accepting connections
  set +e
  psql -U "$db_user" -h localhost -c "\q" >/dev/null 2>&1
  SERVER_STATUS=$?
  set -e

  if [ $SERVER_STATUS -ne 0 ]; then
    unset PGPASSWORD
    error "Cannot connect to PostgreSQL server at localhost:5432. Is the database service running?"
  fi

  # Temporarily disable 'exit on error' just in case the DB already exists
  set +e
  psql -U "$db_user" -h localhost -c "CREATE DATABASE $db_name;" 2>/dev/null
  DB_CREATE_STATUS=$?
  set -e

  if [ $DB_CREATE_STATUS -eq 0 ]; then
    log "Database '$db_name' created successfully."
  else
    warn "Database '$db_name' might already exist or creation failed. Proceeding to import..."
  fi

  log "Importing dump file ($dump_file) into '$db_name'..."
  psql -U "$db_user" -h localhost -d "$db_name" -f "$dump_file" || error "Failed to import SQL dump."

  # Clear the password variable for security
  unset PGPASSWORD
  log "Database setup complete!"
fi

# =============================================================================
# Pre-flight checks (General)
# =============================================================================

log "Running pre-flight checks..."

if [ ! -f "ecosystem.config.js" ]; then
  error "ecosystem.config.js not found. Are you running this from the project root?"
fi

if [ ! -f ".env" ]; then
  error ".env file not found. Copy .env.example to .env and fill in your values before deploying."
fi

# Note: psql was removed from here so standard deployments don't crash without it
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

if pm2 list | grep -q "backend\|frontend"; then
  log "Existing pm2 processes found, reloading..."
  pm2 reload ecosystem.config.js --update-env
else
  log "No existing pm2 processes found, starting..."
  pm2 start ecosystem.config.js
fi

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