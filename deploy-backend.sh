#!/bin/bash

# FYOF Backend Deployment Script
echo "🚀 Starting FYOF Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "fyof-backend/package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Navigate to backend directory
cd fyof-backend

print_status "Checking Node.js and npm versions..."
node --version
npm --version

print_status "Installing dependencies..."
npm install

print_status "Running tests (if any)..."
npm test

print_status "Building application..."
npm run build

print_status "Checking environment variables..."
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.production .env
fi

print_status "Validating server configuration..."
node -e "
const fs = require('fs');
const path = require('path');

// Check if all required files exist
const requiredFiles = ['server.js', 'package.json', 'Procfile'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
    console.error('Missing required files:', missingFiles);
    process.exit(1);
}

console.log('✅ All required files present');

// Check package.json
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!pkg.scripts.start) {
    console.error('Missing start script in package.json');
    process.exit(1);
}

console.log('✅ Package.json configuration valid');
console.log('✅ Ready for deployment');
"

if [ $? -eq 0 ]; then
    print_success "Backend validation completed successfully!"
    print_status "Backend is ready for deployment to Railway/Render/Heroku"
    
    echo ""
    echo "📋 Next Steps:"
    echo "1. Push your code to GitHub"
    echo "2. Connect your GitHub repo to Railway/Render/Heroku"
    echo "3. Set environment variables in your deployment platform:"
    echo "   - NODE_ENV=production"
    echo "   - MONGO_URI=your_mongodb_atlas_connection_string"
    echo "   - JWT_SECRET=your_secure_jwt_secret"
    echo "4. Deploy!"
    
    echo ""
    echo "🔗 Deployment Platforms:"
    echo "Railway: https://railway.app"
    echo "Render: https://render.com"
    echo "Heroku: https://heroku.com"
    
else
    print_error "Backend validation failed!"
    exit 1
fi

cd ..
print_success "Backend deployment preparation completed! 🎉"
