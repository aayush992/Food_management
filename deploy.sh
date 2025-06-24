#!/bin/bash

# FYOF Platform Deployment Script
echo "🚀 Starting FYOF Platform Deployment..."

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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    print_success "All dependencies are installed."
}

# Setup backend for deployment
setup_backend() {
    print_status "Setting up backend for deployment..."
    
    cd fyof-backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Backend dependencies installed successfully."
    else
        print_error "Failed to install backend dependencies."
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        cp .env.production .env
        print_warning "Please update .env file with your actual values before deploying."
    fi
    
    cd ..
}

# Setup frontend for deployment
setup_frontend() {
    print_status "Setting up frontend for deployment..."
    
    cd fyof_frontend
    
    # Check if config.js exists
    if [ ! -f js/config.js ]; then
        print_error "Configuration file js/config.js not found."
        exit 1
    fi
    
    print_warning "Please update js/config.js with your deployed backend URL."
    
    cd ..
}

# Deploy to Railway (Backend)
deploy_backend_railway() {
    print_status "Deploying backend to Railway..."
    
    cd fyof-backend
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    # Login to Railway (user needs to do this manually)
    print_status "Please login to Railway if not already logged in:"
    print_status "Run: railway login"
    
    # Deploy
    print_status "Deploying to Railway..."
    railway up
    
    if [ $? -eq 0 ]; then
        print_success "Backend deployed to Railway successfully!"
    else
        print_error "Failed to deploy backend to Railway."
        exit 1
    fi
    
    cd ..
}

# Deploy to Netlify (Frontend)
deploy_frontend_netlify() {
    print_status "Deploying frontend to Netlify..."
    
    cd fyof_frontend
    
    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
        print_warning "Netlify CLI not found. Installing..."
        npm install -g netlify-cli
    fi
    
    # Login to Netlify (user needs to do this manually)
    print_status "Please login to Netlify if not already logged in:"
    print_status "Run: netlify login"
    
    # Deploy
    print_status "Deploying to Netlify..."
    netlify deploy --prod --dir=.
    
    if [ $? -eq 0 ]; then
        print_success "Frontend deployed to Netlify successfully!"
    else
        print_error "Failed to deploy frontend to Netlify."
        exit 1
    fi
    
    cd ..
}

# Main deployment function
main() {
    echo "🍽️ FYOF Platform Deployment Script"
    echo "=================================="
    
    check_dependencies
    
    echo ""
    echo "Select deployment option:"
    echo "1. Setup for deployment (prepare files)"
    echo "2. Deploy backend to Railway"
    echo "3. Deploy frontend to Netlify"
    echo "4. Full deployment (both backend and frontend)"
    echo "5. Exit"
    
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            setup_backend
            setup_frontend
            print_success "Setup completed! Please update configuration files before deploying."
            ;;
        2)
            setup_backend
            deploy_backend_railway
            ;;
        3)
            setup_frontend
            deploy_frontend_netlify
            ;;
        4)
            setup_backend
            setup_frontend
            deploy_backend_railway
            deploy_frontend_netlify
            print_success "Full deployment completed!"
            ;;
        5)
            print_status "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please select 1-5."
            exit 1
            ;;
    esac
}

# Run main function
main
