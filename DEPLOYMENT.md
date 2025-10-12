# Deployment Guide - Mineral Map CMS

This guide covers deploying the Mineral Map CMS to Netlify.

## Prerequisites

- A Netlify account (free tier works)
- Your Supabase project URL and anon key
- Git repository connected to Netlify

## Netlify Deployment Steps

### 1. Initial Setup

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Add Netlify configuration"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider (GitHub, GitLab, or Bitbucket)
   - Select your repository

### 2. Configure Build Settings

Netlify should auto-detect the settings from `netlify.toml`, but verify:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 20 (specified in `.node-version`)

### 3. Environment Variables

**CRITICAL:** Add your Supabase credentials as environment variables:

1. In Netlify dashboard, go to **Site settings** → **Environment variables**
2. Click **"Add a variable"** and add these two variables:

   | Variable Name | Value | Source |
   |---------------|-------|--------|
   | `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Supabase Dashboard → Settings → API |

   **Example values:**
   - VITE_SUPABASE_URL: `https://iqasjhjmsonzfcfqducr.supabase.co`
   - VITE_SUPABASE_ANON_KEY: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

3. **Important:** These must have the `VITE_` prefix or they won't be accessible in your React app

### 4. Deploy

1. Click **"Deploy site"**
2. Netlify will:
   - Install dependencies (`npm install`)
   - Run build command (`npm run build`)
   - Deploy the `dist` folder

3. Wait for deployment to complete (usually 2-5 minutes)

### 5. Verify Deployment

After deployment succeeds:

1. Click on the generated URL (e.g., `https://your-site-name.netlify.app`)
2. You should be redirected to `/login`
3. Try logging in with your credentials:
   - Email: `dmmineralmap@gmail.com`
   - Password: `supersecret123`

## Troubleshooting

### Build Fails with "Cannot find module"

**Solution:** Make sure all dependencies are in `dependencies` (not `devDependencies`) in `package.json`.

Move any build-time dependencies to `dependencies`:
```bash
npm install --save-prod typescript vite @vitejs/plugin-react @types/react @types/react-dom
```

### Environment Variables Not Working

**Problem:** Variables are undefined in the app

**Solution:**
1. Verify variables have `VITE_` prefix
2. Redeploy the site after adding variables (Netlify requires a rebuild)
3. Check the deploy logs for "Using environment variables" confirmation

### 404 Errors on Page Refresh

**Problem:** Refreshing any page except home shows 404

**Solution:** This is handled by the SPA redirect in `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

If still having issues, check that `netlify.toml` was committed to your repo.

### Build Fails with TypeScript Errors

**Solution:**
1. Run `npm run build` locally to catch errors before deploying
2. Fix all TypeScript errors shown
3. Commit and push fixes

### Supabase Connection Fails

**Problem:** Can't connect to Supabase from deployed site

**Solution:**
1. Verify environment variables are set correctly in Netlify
2. Check Supabase URL is HTTPS (not HTTP)
3. Verify anon key is the **anon key** (not service role key)
4. Check Supabase project is not paused (free tier pauses after inactivity)

## Custom Domain (Optional)

To use a custom domain:

1. In Netlify dashboard, go to **Domain management**
2. Click **"Add custom domain"**
3. Follow instructions to configure DNS records
4. Enable HTTPS (automatic with Netlify)

## Performance Optimization

### Enable Netlify CDN Caching

Already configured in `netlify.toml`:
- Static assets (JS, CSS, images) cached for 1 year
- HTML files served fresh (no caching)

### Enable Asset Optimization

In Netlify dashboard:
1. Go to **Site settings** → **Build & deploy** → **Post processing**
2. Enable:
   - **Bundle CSS**
   - **Minify CSS**
   - **Minify JS**
   - **Pretty URLs**

## Continuous Deployment

With Netlify connected to your Git repository:

1. **Auto-deploy on push:** Every push to `main` branch triggers a new deployment
2. **Deploy previews:** Pull requests get preview URLs automatically
3. **Rollback:** Previous deploys can be rolled back instantly

## Environment-Specific Builds

### Production vs Preview

Netlify automatically creates different contexts:

- **Production:** Deploys from `main` branch
- **Deploy Previews:** Deploys from pull requests
- **Branch Deploys:** Deploys from other branches (optional)

You can set different environment variables for each context if needed.

## Monitoring

### Build Logs

- View real-time build logs in Netlify dashboard
- Logs show npm install, build process, and any errors
- Useful for debugging deployment issues

### Deploy Notifications

Configure in **Site settings** → **Build & deploy** → **Deploy notifications**:
- Slack notifications
- Email notifications
- Webhook notifications

## Security Best Practices

1. ✅ Never commit `.env` file (already in `.gitignore`)
2. ✅ Use environment variables for all secrets
3. ✅ Use Supabase RLS policies for data security
4. ✅ Enable HTTPS (automatic with Netlify)
5. ✅ Security headers configured in `netlify.toml`

## Cost Considerations

**Netlify Free Tier includes:**
- 100 GB bandwidth/month
- 300 build minutes/month
- Automatic HTTPS
- Continuous deployment
- Deploy previews

This is typically sufficient for CMS applications with moderate traffic.

## Quick Reference

### Deploy Commands
```bash
# Test build locally before deploying
npm run build

# Preview build locally
npm run preview

# View build output
ls -la dist/
```

### Important Files
- `netlify.toml` - Netlify configuration
- `.node-version` - Node.js version for builds
- `vite.config.ts` - Vite build configuration
- `dist/` - Build output directory (not committed to Git)

### Helpful Netlify CLI Commands (Optional)

Install Netlify CLI:
```bash
npm install -g netlify-cli
```

Commands:
```bash
# Login to Netlify
netlify login

# Deploy to preview
netlify deploy

# Deploy to production
netlify deploy --prod

# Open site in browser
netlify open
```

## Need Help?

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Documentation](https://supabase.com/docs)
- Check Netlify deploy logs for specific error messages
