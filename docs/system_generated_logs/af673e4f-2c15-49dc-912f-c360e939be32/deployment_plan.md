# OtterLink Ionos & Laragon Deployment & Hosting Plan

This document outlines the exact blueprints for:
1. **Current Online Testing:** Hosting OtterLink inside the subfolder of your test domain: `http://s830966484.onlinehome.us/otterlink`.
2. **Future Local Desktop Setup:** Running OtterLink locally via the **Laragon** development environment on your other machine.

---

## 🌐 Part 1: Current Ionos Subfolder Deployment
**Test URL:** `http://s830966484.onlinehome.us/otterlink`

Because the application is hosted in the `/otterlink` subfolder (rather than the root domain), we must adjust the asset mapping and rewrite rules before building. Otherwise, the browser will look for assets at the root domain (`http://s830966484.onlinehome.us/assets/...`) and fail to load them.

### Step 1: Adjust Vite Base Path
Before running the build, Vite must be told that assets are located inside the `/otterlink/` folder. We do this in `vite.config.ts`.
* Change `base` path to: `"/otterlink/"`

### Step 2: Custom Apache `.htaccess` for Subfolder
To prevent 404 router errors when users refresh their browser while inside the subfolder, create an `.htaccess` file specifically mapped to the `/otterlink/` directory.
Write the following contents to `y:\otterlink\.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /otterlink/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /otterlink/index.html [L]
</IfModule>
```

### Step 3: Copy Assets to the Y Drive
Once Vite is built with the `/otterlink/` base path, copy the entire contents of the `dist` directory to the root of the Y drive (`y:\otterlink\`).

---

## 💻 Part 2: Laragon Local Desktop Setup
**Laragon** is a fast, lightweight, and isolated local development server environment for Windows. It is perfect for hosting static web projects and running Node.js tasks.

When you set up your other desktop machine, here is how to configure Laragon for OtterLink:

### Option A: Hosting the Static Build (Easiest Local Testing)
If you just want to run the compiled production assets locally on your new desktop:

1. **Create the Project Directory:**
   * Create a new folder inside Laragon's root directory: `C:\laragon\www\otterlink`
2. **Deploy the compiled files:**
   * Copy the local `dist` folder contents (HTML, CSS, JS, and `.htaccess`) into `C:\laragon\www\otterlink`.
3. **Local Domain Auto-Generation:**
   * Laragon automatically detects the folder and generates a local virtual host domain: `http://otterlink.test/`.
4. **Apache `.htaccess` Rewrite:**
   * Since Laragon uses Apache, the `.htaccess` file we created for root domain deployments will automatically work locally. Keep the rewrite base as `/` in your local `.htaccess` file:
     ```apache
     <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
     </IfModule>
     ```

---

### Option B: Real-Time Development & Hot Reloading (Best for Coding)
If you want to edit and develop OtterLink directly on the new machine with instant, real-time hot reloading in your browser:

1. **Install Prerequisites:**
   * Laragon includes Node.js and npm out-of-the-box, but ensure you have standard Node.js active in Laragon's settings.
2. **Move Source Code to Laragon:**
   * Place the **raw source files** (not the compiled `dist` files) inside a folder, for example: `C:\laragon\www\otterlink-source`.
3. **Install dependencies:**
   * Open the Laragon Terminal, navigate to your folder:
     ```bash
     cd C:\laragon\www\otterlink-source
     npm install
     ```
4. **Run Vite Dev Server:**
   * Start the live hot-reloading development server:
     ```bash
     npm run dev
     ```
   * Vite will spin up a dev server at `http://localhost:8080/`. Any changes you make to your React components will immediately hot-reload in the browser.
5. **Connecting to Supabase:**
   * Ensure that the `.env` file containing your `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` is placed in the root of `C:\laragon\www\otterlink-source`. Vite will load them automatically!

---

## 🎯 Automation Pipeline Execution

I can perform the entire online subfolder deployment build and sync for you right now:
1. **Modify `vite.config.ts`** to set the base path to `"/otterlink/"`.
2. **Run `npm run build`** locally to compile the production-ready static assets.
3. **Create the custom `.htaccess`** URL rewrite file mapped to `/otterlink/`.
4. **Copy all assets** directly to the Y drive (`y:\otterlink\`).
5. **Revert `vite.config.ts` base path** back to `/` locally so your local dev environments remain clean.

Let me know if you would like me to trigger this automation pipeline!
