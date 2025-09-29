# Cannabis E-commerce Web Application - VPS Installation Guide

A comprehensive bilingual (Myanmar/English) cannabis e-commerce platform with admin management panel, built with React, TypeScript, and Express.js.

## 🚀 Features

- **Bilingual Support**: Myanmar (primary) and English
- **Product Management**: Multi-tier quality system with media support
- **Contact-Based Ordering**: Telegram, WhatsApp, Messenger integration
- **Admin Panel**: Complete CRUD operations for products, FAQ, and contact info
- **Cloud Storage**: Supabase integration for file uploads
- **Responsive Design**: Mobile-first approach with modern UI

## 📋 Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher  
- **PostgreSQL**: v14.0 or higher (or Supabase account)
- **Git**: For cloning the repository

### External Services Required
- **Supabase Account**: For database and file storage
- **Domain/VPS**: For deployment

## 🛠️ Installation Steps

### 1. Server Setup & Clone Repository

```bash
# Update your VPS
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL (if not using Supabase)
sudo apt install postgresql postgresql-contrib -y

# Clone the repository
git clone <your-repository-url>
cd <your-project-directory>
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm run check
```

### 3. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

#### Configure Database Schema
```bash
# Set your Supabase DATABASE_URL
export DATABASE_URL="postgresql://[username]:[password]@[host]:[port]/[database]?sslmode=require"

# Push database schema
npm run db:push
```

#### Setup Storage Bucket
1. In Supabase Dashboard → Storage
2. Create a new bucket named `product-images`
3. Set bucket to `public` for product images
4. Note your storage URL

### 4. Environment Configuration

Create `.env` file in project root:

```env
# Database Configuration
DATABASE_URL="postgresql://[username]:[password]@[host]:[port]/[database]?sslmode=require"
PGHOST="your-supabase-host"
PGPORT="5432"
PGDATABASE="postgres"
PGUSER="postgres"
PGPASSWORD="your-password"

# Supabase Configuration
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# Storage Configuration
DEFAULT_OBJECT_STORAGE_BUCKET_ID="product-images"
PUBLIC_OBJECT_SEARCH_PATHS="/public"
PRIVATE_OBJECT_DIR="/.private"

# Application Configuration
NODE_ENV="production"
PORT="5000"
```

### 5. Database Initialization

```bash
# Initialize database with sample data
npm run dev
# This will automatically seed the database on first run

# Or manually seed (if needed)
# The app includes automatic database seeding
```

### 6. Build Application

```bash
# Build frontend and backend
npm run build

# Test the build
npm start
```

### 7. Process Manager Setup (PM2)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'cannabis-ecommerce',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Nginx Reverse Proxy Setup

```bash
# Install Nginx
sudo apt install nginx -y

# Create site configuration
sudo tee /etc/nginx/sites-available/cannabis-ecommerce << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/cannabis-ecommerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal setup
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Configuration

### Admin Access
- **Username**: `admin`
- **Password**: `admin`
- **URL**: `https://your-domain.com/admin`

### Default Quality Tiers
- **High Quality**: Premium products
- **Medium Quality**: Standard products  
- **Low Quality**: Basic products

### Contact Platforms
- **Telegram**: Configure in admin panel
- **WhatsApp**: Configure in admin panel
- **Messenger**: Configure in admin panel

## 📱 Usage

### Admin Panel Features
1. **Product Management**: Add/edit/delete products with images
2. **FAQ Management**: Manage bilingual FAQ content
3. **Contact Management**: Update contact URLs and QR codes
4. **Content Management**: Update site content

### Customer Features
1. **Browse Products**: Filter by quality tier
2. **Product Details**: View specifications and media
3. **Contact Orders**: Direct messaging integration
4. **Bilingual Support**: Switch between Myanmar and English

## 🔍 Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
# Check environment variables
printenv | grep DATABASE_URL

# Test connection
npm run db:push
```

**File Upload Issues:**
```bash
# Verify Supabase storage configuration
# Check bucket permissions in Supabase dashboard
```

**Build Errors:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Logs Location
- **Application**: `./logs/`
- **Nginx**: `/var/log/nginx/`
- **PM2**: `pm2 logs cannabis-ecommerce`

## 🚀 Deployment Updates

```bash
# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Rebuild application
npm run build

# Restart application
pm2 restart cannabis-ecommerce
```

## 📧 Support

For issues or questions:
1. Check logs: `pm2 logs cannabis-ecommerce`
2. Verify environment variables
3. Check database connectivity
4. Review Nginx configuration

## 📄 License

MIT License - see LICENSE file for details.

---

## 🏗️ Development Environment

### Local Development Setup
```bash
# Start development server
npm run dev

# Available scripts
npm run build    # Build for production
npm run start    # Start production server
npm run check    # TypeScript check
npm run db:push  # Push database schema
```

### Project Structure
```
├── client/          # React frontend
│   ├── src/
│   ├── components/
│   └── pages/
├── server/          # Express backend
│   ├── routes.ts
│   └── storage.ts
├── shared/          # Shared types and schemas
├── package.json
└── README.md
```

This comprehensive guide provides all the necessary steps to deploy your cannabis e-commerce application on any VPS server with proper production configuration.