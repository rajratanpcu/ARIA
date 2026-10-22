# ARIA Prototype — Vercel Deployment Guide
### Fast, Free, Zero-Configuration Production Hosting

This project is pre-configured with `vercel.json` for seamless deployment to Vercel. Choose any of the three methods below to launch the prototype live on the internet.

---

## Method 1: Instant 1-Command CLI Deployment (Fastest)

If you have Node.js installed on your computer, run:

### Windows:
Simply double-click the included helper script:
```
C:\Users\Raj Ratan\Desktop\CEP\deploy-vercel.bat
```
*Or open PowerShell / Command Prompt in `C:\Users\Raj Ratan\Desktop\CEP` and run:*
```bash
npx vercel --prod
```

### macOS / Linux:
```bash
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

### What to expect during first-time CLI login:
1. **Log in**: Vercel will ask you to log in via GitHub, GitLab, Bitbucket, or Email (press Enter to open browser).
2. **Set up and deploy**: Press `Enter` to accept defaults (`Y` to set up and deploy).
3. **Scope**: Select your personal Vercel team/account.
4. **Link to existing project**: Type `N` (creates a new project named `aria-mobile-devops`).
5. **Project settings**: Press `Enter` to accept the pre-configured `vercel.json` settings (`Vite` preset).
6. **Live URL**: Vercel will build and output your production HTTPS URL in ~30 seconds (e.g., `https://aria-mobile-devops.vercel.app`).

---

## Method 2: Git Repository Import via Vercel Dashboard (Recommended for Continuous CI/CD)

Deploy directly from GitHub so any future commits automatically deploy to production:

1. **Initialize Git & Push to GitHub**:
   ```bash
   cd "C:\Users\Raj Ratan\Desktop\CEP"
   git init
   git add .
   git commit -m "feat: ARIA Autonomous Mobile DevOps Platform with Enterprise Theme"
   git branch -M main
   # Create a repository on github.com, then link and push:
   git remote add origin https://github.com/<your-username>/aria-mobile-devops.git
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Click **Import** next to your `aria-mobile-devops` repository.
   - Vercel automatically detects the **Vite** framework from `vercel.json`.
   - Click **Deploy**.
   - Your live production URL will be ready in under 1 minute.

---

## Method 3: Instant Drag & Drop via Vercel Web Dashboard (Zero Terminal Required)

If you prefer deploying via your web browser without running commands:

1. Build the production bundle locally:
   ```bash
   cd "C:\Users\Raj Ratan\Desktop\CEP"
   npm run build
   ```
2. Navigate to [vercel.com/new](https://vercel.com/new).
3. Drag and drop the generated `dist` folder directly onto the Vercel import dropzone.
4. Vercel deploys it immediately and provides a live preview URL.

---

## Pre-Configured Vercel Architecture (`vercel.json`)

Your repository includes an enterprise-ready `vercel.json`:
* **Framework**: `vite` preset automatically builds using `npm run build`.
* **Output Directory**: `dist` with cache-busted static asset hashing.
* **SPA Routing**: Automatic URL rewrites redirect all client-side routes (`/`, `/agents`, `/afp`, `/releases`, `/governance`, etc.) to `/index.html` without 404 errors.
* **Static Assets**: HTTP `Cache-Control: public, max-age=31536000, immutable` headers for high-performance global CDN edge delivery.
* **Direct Prototype Route**: Navigating to `/prototype` directly serves the standalone `aria-interactive-prototype.html`.
