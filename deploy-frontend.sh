#!/bin/bash

# FYOF Frontend Deployment Script
echo "🌐 Starting FYOF Frontend Deployment..."

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
if [ ! -d "fyof_frontend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Navigate to frontend directory
cd fyof_frontend

print_status "Validating frontend files..."

# Check for required files
required_files=(
    "index.html"
    "js/config.js"
    "netlify.toml"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    print_error "Missing required files: ${missing_files[*]}"
    exit 1
fi

print_success "All required files present"

print_status "Checking configuration..."
node -e "
const fs = require('fs');

// Check config.js
if (fs.existsSync('js/config.js')) {
    const configContent = fs.readFileSync('js/config.js', 'utf8');
    if (configContent.includes('your-backend-url')) {
        console.error('❌ Please update the backend URL in js/config.js');
        process.exit(1);
    }
    console.log('✅ Configuration file updated');
} else {
    console.error('❌ Configuration file missing');
    process.exit(1);
}

// Check netlify.toml
if (fs.existsSync('netlify.toml')) {
    console.log('✅ Netlify configuration present');
} else {
    console.error('❌ Netlify configuration missing');
    process.exit(1);
}

console.log('✅ Frontend validation completed');
"

if [ $? -eq 0 ]; then
    print_success "Frontend validation completed successfully!"
    
    print_status "Optimizing files for production..."
    
    # Create a build directory
    mkdir -p build
    
    # Copy all files to build directory
    cp -r * build/ 2>/dev/null || true
    
    # Remove unnecessary files from build
    rm -rf build/build 2>/dev/null || true
    
    print_status "Creating deployment package..."
    
    # Create a zip file for manual deployment
    if command -v zip &> /dev/null; then
        zip -r fyof-frontend-deployment.zip . -x "build/*" "*.sh" "*.md" 2>/dev/null || true
        print_success "Deployment package created: fyof-frontend-deployment.zip"
    fi
    
    echo ""
    echo "📋 Frontend Deployment Options:"
    echo ""
    echo "🔥 Option 1: Netlify (Recommended)"
    echo "1. Go to https://netlify.com"
    echo "2. Drag and drop the fyof_frontend folder"
    echo "3. Or connect your GitHub repository"
    echo "4. Netlify will automatically deploy"
    echo ""
    echo "🚀 Option 2: Vercel"
    echo "1. Go to https://vercel.com"
    echo "2. Import your GitHub repository"
    echo "3. Set build command to: echo 'Static site'"
    echo "4. Set output directory to: ."
    echo ""
    echo "📁 Option 3: GitHub Pages"
    echo "1. Push code to GitHub"
    echo "2. Go to repository Settings > Pages"
    echo "3. Select source branch"
    echo "4. Your site will be available at username.github.io/repo-name"
    echo ""
    echo "☁️ Option 4: Firebase Hosting"
    echo "1. Install Firebase CLI: npm install -g firebase-tools"
    echo "2. Run: firebase login"
    echo "3. Run: firebase init hosting"
    echo "4. Run: firebase deploy"
    echo ""
    echo "🌐 Option 5: Surge.sh"
    echo "1. Install Surge: npm install -g surge"
    echo "2. Run: surge"
    echo "3. Follow the prompts"
    
    echo ""
    echo "⚙️ Important Notes:"
    echo "- Update js/config.js with your deployed backend URL"
    echo "- Ensure CORS is configured in your backend for your frontend domain"
    echo "- Test all functionality after deployment"
    
else
    print_error "Frontend validation failed!"
    exit 1
fi

cd ..
print_success "Frontend deployment preparation completed! 🎉"
