# Vercel Deployment Guide - Healthy Catering Landing Page

## ✅ Pre-Deployment Checklist

### Configuration Files (READY)
- ✅ `vercel.json` - Vercel configuration created
- ✅ `.vercelignore` - Build exclusions configured
- ✅ `package.json` - Project metadata ready
- ✅ No hardcoded localhost URLs found

### Assets Required Before Deployment

#### 1. Logo (Required)
- **Location**: `assets/icons/logo.svg`
- **Format**: SVG
- **Size**: 40x40px viewBox recommended
- **Usage**: Navigation brand, footer

#### 2. Service Icons (Required)
Create these SVG icons in `assets/icons/`:
- `business-event.svg` - Corporate events (briefcase/meeting icon)
- `wedding.svg` - Weddings (rings/celebration icon)
- `fitness.svg` - Fitness retreats (dumbbell/activity icon)
- `meal-prep.svg` - Personal meal prep (container icon)

#### 3. Hero Image (Required)
- **Location**: `images/hero/hero-main.webp`
- **Recommended size**: 1920x1080px
- **Alt text**: "Assortment of fresh, healthy meals on white plates"
- **Format**: WebP with JPEG fallback for older browsers

#### 4. Menu Items (Required - 6 images)
Create responsive versions in `images/menu/`:

For each dish (dish1-dish6):
- `dish1.webp`, `dish1-320.webp`, `dish1-768.webp`, `dish1-1200.webp`
- `dish2.webp`, `dish2-320.webp`, `dish2-768.webp`, `dish2-1200.webp`
- `dish3.webp`, `dish3-320.webp`, `dish3-768.webp`, `dish3-1200.webp`
- `dish4.webp`, `dish4-320.webp`, `dish4-768.webp`, `dish4-1200.webp`
- `dish5.webp`, `dish5-320.webp`, `dish5-768.webp`, `dish5-1200.webp`
- `dish6.webp`, `dish6-320.webp`, `dish6-768.webp`, `dish6-1200.webp`

#### 5. Team Photos (Required - 4 images)
- **Location**: `images/team/`
- `chef-main.webp` - Head Chef photo
- `manager-main.webp` - Operations Manager photo
- `nutritionist-main.webp` - Nutritionist photo
- `owner-main.webp` - Founder photo
- **Size**: 200x200px (square)

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from project directory:
   ```bash
   cd /Users/ariefyunansyah/Documents/Capypack/Didiw
   vercel
   ```

4. Follow prompts:
   - Set up and deploy? **Y**
   - Which scope? (select your account)
   - Link to existing project? **N**
   - Project name? **healthy-catering** (or your preference)
   - In which directory is your code located? **./** (default)

5. Deploy to production:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import Git repository or drag/drop project folder
3. Vercel auto-detects static site (no build command needed)
4. Click "Deploy"

### Option 3: Connect Git Repository

1. Push project to GitHub/GitLab/Bitbucket
2. Import repository in Vercel dashboard
3. Auto-deploys on every push to main branch

## 🔧 Environment Variables (Optional)

If using a real email service, add in Vercel dashboard:
- `EMAIL_SERVICE_API_KEY` - Your email service API key
- `CONTACT_EMAIL` - Recipient email for contact form

## 📝 Post-Deployment Tasks

1. **Test the live site**:
   - Check all navigation links work
   - Verify images load correctly
   - Test contact form submission
   - Check mobile responsiveness

2. **Configure Custom Domain** (optional):
   - In Vercel dashboard: Settings > Domains
   - Add your custom domain
   - Update DNS records as instructed

3. **Enable Analytics** (optional):
   - Vercel Analytics (free tier available)
   - Add Google Analytics if needed

4. **Performance Monitoring**:
   - Run Lighthouse audit on live URL
   - Verify PageSpeed scores meet targets (85+ mobile, 95+ desktop)

## 🎨 Image Placeholder Service (For Testing)

If you want to deploy now for testing without real images, you can temporarily use:
- https://placeholder.com/
- https://via.placeholder.com/
- https://picsum.photos/

**Note**: Replace with real images before production launch.

## 📊 Expected Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s
- **PageSpeed Score**: 85+ mobile, 95+ desktop

## 🔒 Security Headers (Auto-configured by Vercel)

Vercel automatically adds:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection

## 📞 Support

For Vercel deployment issues:
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Email: support@vercel.com
