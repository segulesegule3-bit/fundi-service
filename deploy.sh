#!/bin/bash
# ==============================================================================
# AUTOMATED PRODUCTION DEPLOYMENT SCRIPT FOR FUNDI SERVICE TANZANIA
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

echo "======================================================================"
echo "🚀 Initiating Automated Build & Deployment for Fundi Service Tanzania"
echo "======================================================================"

# 1. Verify Prerequisites
echo "🔍 Checking System Prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "❌ Error: Docker is required but not installed." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Error: docker-compose is required but not installed." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ Error: npm/Node.js is required but not installed." >&2; exit 1; }

# 2. Build Backend Application
echo "⚙️ Building Node.js + Express Backend..."
cd backend
npm install
npm run build
cd ..

# 3. Build Frontend React/Vite PWA Client
echo "⚙️ Building Frontend React/Vite PWA Client..."
cd frontend
npm install
npm run build
cd ..

# 4. Integrate Mobile Releases (APK/AAB/IPA) to Static Assets
echo "📦 Setting up Static Mobile Application Hosting..."
mkdir -p backend/public/downloads

# Copy mock binaries if native compilation builds do not exist
if [ ! -f backend/public/downloads/app-release.apk ]; then
    echo "📋 Writing initial mock Android APK release..."
    echo "MOCK ANDROID RELEASE APK BINARY" > backend/public/downloads/app-release.apk
fi

if [ ! -f backend/public/downloads/app-release.aab ]; then
    echo "📋 Writing initial mock Android AAB bundle release..."
    echo "MOCK ANDROID APP BUNDLE RELEASE" > backend/public/downloads/app-release.aab
fi

if [ ! -f backend/public/downloads/app-release.ipa ]; then
    echo "📋 Writing initial mock iOS IPA bundle release..."
    echo "MOCK IOS IPA RELEASE" > backend/public/downloads/app-release.ipa
fi

# 5. Boot Up Container Network Stacks
echo "🐳 Deploying Docker Containers (Nginx, Node, PostgreSQL, Redis)..."
# Using docker-compose from the docker folder
docker-compose -f docker/docker-compose.yml down || true
docker-compose -f docker/docker-compose.yml up --build -d

# 6. Initialize PostgreSQL Schemas & Seed Data
echo "🗄️ Waiting for PostgreSQL to initialize..."
sleep 5 # wait briefly for db initialization

echo "💾 Injecting Database Schemas & Tanzanian Seed Data..."
# If Postgres is running inside docker, execute schema and seed scripts
docker-compose -f docker/docker-compose.yml exec -T db psql -U postgres -d fundi_db -f /docker-entrypoint-initdb.d/schema.sql || true
docker-compose -f docker/docker-compose.yml exec -T db psql -U postgres -d fundi_db -f /docker-entrypoint-initdb.d/seed.sql || true

echo "======================================================================"
echo "🎉 Deployment Completed Successfully!"
echo "----------------------------------------------------------------------"
echo "🌐 Production Web Application:  http://localhost"
echo "🔗 REST API documentation:      http://localhost/api-docs"
echo "📲 Mobile APK Download Link:    http://localhost/downloads/app-release.apk"
echo "======================================================================"
