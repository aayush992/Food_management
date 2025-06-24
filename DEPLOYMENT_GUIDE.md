# 🚀 **FYOF PLATFORM DEPLOYMENT GUIDE**

## 📋 **DEPLOYMENT OPTIONS**

### **🎯 RECOMMENDED DEPLOYMENT STACK:**
- **Frontend:** Netlify or Vercel (Free)
- **Backend:** Railway, Render, or Heroku (Free/Paid)
- **Database:** MongoDB Atlas (Free)
- **Domain:** Custom domain (Optional)

---

## 🗄️ **STEP 1: DATABASE DEPLOYMENT (MongoDB Atlas)**

### **Create MongoDB Atlas Account:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for free account
3. Create new cluster (Free M0 tier)
4. Choose cloud provider and region
5. Create database user with username/password
6. Whitelist IP addresses (0.0.0.0/0 for all IPs)

### **Get Connection String:**
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/fyof`

### **Migrate Your Data:**
```bash
# Export your local data
mongodump --db fyof --out ./fyof-backup

# Import to Atlas (replace with your connection string)
mongorestore --uri "mongodb+srv://username:password@cluster.mongodb.net/fyof" ./fyof-backup/fyof
```

---

## 🖥️ **STEP 2: BACKEND DEPLOYMENT**

### **Option A: Railway (Recommended)**

#### **Prepare Backend for Deployment:**
1. Create `package.json` scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

2. Update environment variables in `.env`:
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fyof
JWT_SECRET=your-super-secret-jwt-key-here
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

#### **Deploy to Railway:**
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your backend repository
5. Add environment variables in Railway dashboard
6. Deploy automatically

### **Option B: Render**

#### **Deploy to Render:**
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Add all environment variables
6. Deploy

### **Option C: Heroku**

#### **Deploy to Heroku:**
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create fyof-backend

# Set environment variables
heroku config:set MONGO_URI="your-atlas-connection-string"
heroku config:set JWT_SECRET="your-jwt-secret"

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

---

## 🌐 **STEP 3: FRONTEND DEPLOYMENT**

### **Option A: Netlify (Recommended)**

#### **Prepare Frontend:**
1. Update API endpoints in all frontend files:
```javascript
// Replace localhost with your deployed backend URL
const API_BASE = 'https://your-backend-url.railway.app/api';
```

#### **Deploy to Netlify:**
1. Go to [Netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Drag and drop your `fyof_frontend` folder
4. Or connect GitHub repository
5. Configure build settings:
   - **Build command:** (leave empty for static site)
   - **Publish directory:** `/` or `fyof_frontend`
6. Deploy

### **Option B: Vercel**

#### **Deploy to Vercel:**
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your frontend repository
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `fyof_frontend`
5. Deploy

### **Option C: GitHub Pages**

#### **Deploy to GitHub Pages:**
1. Create GitHub repository
2. Upload frontend files to repository
3. Go to repository Settings → Pages
4. Select source branch (main)
5. Your site will be available at: `https://username.github.io/repository-name`

---

## 🔧 **STEP 4: CONFIGURATION UPDATES**

### **Update Frontend API URLs:**

Create a configuration file:

```javascript
// js/config.js
const CONFIG = {
  API_BASE: window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://your-backend-url.railway.app/api'
};
```

### **Update CORS in Backend:**
```javascript
// server.js
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-frontend-url.netlify.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

### **Environment Variables for Production:**
```env
# Backend .env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fyof
JWT_SECRET=super-secret-production-key
RAZORPAY_KEY_ID=rzp_live_your_key
RAZORPAY_KEY_SECRET=your_secret_key
FRONTEND_URL=https://your-frontend-url.netlify.app
```

---

## 🔒 **STEP 5: SECURITY & PRODUCTION SETUP**

### **Backend Security:**
1. **Rate Limiting:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

2. **Helmet for Security Headers:**
```javascript
const helmet = require('helmet');
app.use(helmet());
```

3. **Environment Variables:**
- Never commit `.env` files
- Use platform-specific environment variable settings

### **Database Security:**
1. **MongoDB Atlas:**
   - Enable authentication
   - Restrict IP access
   - Use strong passwords
   - Enable encryption at rest

### **Payment Security:**
1. **Razorpay Production:**
   - Use live API keys
   - Implement webhook verification
   - Enable payment capture
   - Set up proper error handling

---

## 🌍 **STEP 6: CUSTOM DOMAIN (Optional)**

### **Setup Custom Domain:**

#### **For Netlify:**
1. Buy domain from provider (GoDaddy, Namecheap, etc.)
2. In Netlify dashboard: Site settings → Domain management
3. Add custom domain
4. Update DNS records as instructed
5. Enable HTTPS (automatic)

#### **For Backend (Railway):**
1. In Railway dashboard: Settings → Domains
2. Add custom domain
3. Update DNS CNAME record
4. SSL certificate auto-generated

---

## 📊 **STEP 7: MONITORING & ANALYTICS**

### **Add Monitoring:**
1. **Google Analytics** for frontend
2. **Sentry** for error tracking
3. **Uptime monitoring** (UptimeRobot)
4. **Performance monitoring** (New Relic)

### **Database Monitoring:**
1. **MongoDB Atlas** built-in monitoring
2. **Performance alerts**
3. **Backup scheduling**

---

## 🧪 **STEP 8: TESTING DEPLOYMENT**

### **Test Checklist:**
- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] Database connection works
- [ ] User registration/login
- [ ] Cart functionality
- [ ] Order placement
- [ ] Payment processing
- [ ] Admin dashboard
- [ ] Mobile responsiveness
- [ ] HTTPS enabled
- [ ] Performance optimization

### **Load Testing:**
```bash
# Install artillery for load testing
npm install -g artillery

# Create test script
artillery quick --count 10 --num 5 https://your-backend-url.railway.app/api/outlets
```

---

## 🚀 **QUICK DEPLOYMENT COMMANDS**

### **One-Click Deployment:**
```bash
# Backend to Railway
git add .
git commit -m "Deploy to production"
git push origin main

# Frontend to Netlify (drag & drop)
# Or use Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=fyof_frontend
```

---

## 📋 **POST-DEPLOYMENT CHECKLIST**

### **✅ Verify Everything Works:**
- [ ] Website loads on custom domain
- [ ] All pages accessible
- [ ] User registration works
- [ ] Login/logout functionality
- [ ] Cart operations (add/remove/update)
- [ ] Order placement end-to-end
- [ ] Payment processing (test mode first)
- [ ] Admin dashboard accessible
- [ ] Database operations working
- [ ] Email notifications (if implemented)
- [ ] Mobile responsiveness
- [ ] Page load speeds < 3 seconds
- [ ] SSL certificate active
- [ ] Error pages working (404, 500)

### **🔧 Performance Optimization:**
- [ ] Image compression
- [ ] CSS/JS minification
- [ ] CDN setup (optional)
- [ ] Caching headers
- [ ] Database indexing

---

## 🎯 **ESTIMATED COSTS**

### **Free Tier (Recommended for Testing):**
- **MongoDB Atlas:** Free (512MB)
- **Railway/Render:** Free tier available
- **Netlify:** Free (100GB bandwidth)
- **Domain:** $10-15/year (optional)

### **Production Tier:**
- **MongoDB Atlas:** $9/month (2GB)
- **Railway:** $5/month
- **Netlify Pro:** $19/month
- **Domain:** $10-15/year

**Total Monthly Cost:** ~$15-35/month for production

---

## 🆘 **TROUBLESHOOTING**

### **Common Issues:**
1. **CORS Errors:** Update backend CORS configuration
2. **Database Connection:** Check MongoDB Atlas IP whitelist
3. **Environment Variables:** Verify all variables are set
4. **Build Failures:** Check Node.js version compatibility
5. **Payment Issues:** Verify Razorpay keys and webhook URLs

### **Support Resources:**
- **Railway:** [docs.railway.app](https://docs.railway.app)
- **Netlify:** [docs.netlify.com](https://docs.netlify.com)
- **MongoDB Atlas:** [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

---

## 🎉 **CONGRATULATIONS!**

Your FYOF platform is now deployed and ready for production use! 🚀🍽️

**Next Steps:**
1. Test all functionality thoroughly
2. Set up monitoring and analytics
3. Configure payment gateway for live transactions
4. Launch marketing campaigns
5. Gather user feedback and iterate

**Your food ordering platform is now live and serving customers!** 🎊
