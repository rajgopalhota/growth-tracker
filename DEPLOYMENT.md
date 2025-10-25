# GrowthTracker Production Deployment Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB database (local or cloud)
- Domain name (optional)

## Environment Setup

1. **Create `.env.local` file** with the following variables:
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/growth-tracker
DB_NAME=growth-tracker

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-change-this-in-production

# Production Settings
NODE_ENV=production
```

2. **Generate a secure NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

## Database Setup

1. **Install MongoDB** (if using local):
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
```

2. **Start MongoDB**:
```bash
mongod
```

3. **Create database** (optional, will be created automatically):
```bash
mongo
use growth-tracker
```

## Production Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Deploy**:
```bash
vercel
```

3. **Set environment variables** in Vercel dashboard:
- MONGODB_URI
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- DB_NAME

### Option 2: Manual Server

1. **Build the application**:
```bash
npm run build
```

2. **Start production server**:
```bash
npm start
```

3. **Use PM2 for process management**:
```bash
npm install -g pm2
pm2 start npm --name "growth-tracker" -- start
pm2 save
pm2 startup
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Database connection working
- [ ] SSL certificate installed (if using custom domain)
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Backup strategy implemented
- [ ] Performance monitoring configured
- [ ] Security headers configured

## Security Considerations

1. **Change default NEXTAUTH_SECRET**
2. **Use HTTPS in production**
3. **Set up proper CORS policies**
4. **Implement rate limiting**
5. **Regular security updates**

## Monitoring

- Set up error tracking (Sentry)
- Monitor database performance
- Track user analytics
- Monitor server resources

## Backup Strategy

1. **Database backups**:
```bash
mongodump --db growth-tracker --out /backup/path
```

2. **Automated backups** (cron job):
```bash
0 2 * * * mongodump --db growth-tracker --out /backup/path/$(date +\%Y\%m\%d)
```

## Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Check MONGODB_URI format
   - Verify database is running
   - Check network connectivity

2. **Authentication issues**:
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches domain
   - Clear browser cookies

3. **Build errors**:
   - Check Node.js version (18+)
   - Clear node_modules and reinstall
   - Check for missing dependencies

### Performance Optimization

1. **Enable compression**:
```javascript
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
}
```

2. **Optimize images**:
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-domain.com'],
  },
}
```

3. **Database indexing**:
```javascript
// Add indexes to models for better performance
db.notes.createIndex({ "createdBy": 1, "createdAt": -1 })
db.todos.createIndex({ "assignee": 1, "status": 1 })
db.goals.createIndex({ "createdBy": 1, "status": 1 })
```

## Support

For issues and questions:
- Check the GitHub repository
- Review the documentation
- Contact support team
