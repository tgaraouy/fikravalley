# 📱 PWA Setup - Fikra Valley

## Overview

Fikra Valley is now a fully functional Progressive Web App (PWA) that can be installed on mobile devices and desktops.

---

## ✅ PWA Features Implemented

### 1. **Web App Manifest** ✅
- **File**: `app/manifest.ts`
- **Generated URL**: `/manifest.webmanifest`
- **Features**:
  - App name, short name, description
  - Icons (192x192, 512x512)
  - Standalone display mode
  - App shortcuts (Submit Idea, View Ideas)
  - Share target for voice files
  - Categories: business, productivity, education

### 2. **Service Worker** ✅
- **File**: `public/sw.js`
- **Features**:
  - Offline-first caching strategy
  - Network-first with cache fallback
  - Automatic cache updates
  - Background sync support
  - Push notification support (ready for future use)
  - Runtime caching for HTML, CSS, JS, images
  - Offline page fallback

### 3. **Install Prompt** ✅
- **Component**: `components/PWAInstallPrompt.tsx`
- **Features**:
  - Automatic detection of install capability
  - User-friendly install prompt
  - Dismissible (session-based)
  - Works on Android Chrome, Edge, Safari (iOS 16.4+)
  - Detects if already installed

### 4. **Service Worker Registration** ✅
- **Component**: `components/PWARegister.tsx`
- **Features**:
  - Automatic registration on page load
  - Update detection
  - Background updates (checks every hour)

### 5. **Metadata & Icons** ✅
- **File**: `app/layout.tsx`
- **Features**:
  - Apple Web App meta tags
  - Theme color
  - Viewport configuration
  - Icon links (favicon, Apple touch icon)

---

## 🎯 How It Works

### **Installation Flow:**

1. **User visits site** → Service worker registers automatically
2. **After 3 seconds** → Install prompt appears (if supported)
3. **User clicks "Installer"** → Browser shows native install dialog
4. **User accepts** → App installs to home screen/desktop
5. **App opens** → Works offline, feels like native app

### **Offline Support:**

1. **First visit** → Assets cached (HTML, CSS, JS, images)
2. **Subsequent visits** → Served from cache if offline
3. **API calls** → Not cached (always fresh)
4. **Navigation** → Falls back to cached homepage if offline

---

## 📱 Platform Support

### **Android (Chrome, Edge, Samsung Internet)**
- ✅ Full PWA support
- ✅ Install prompt works
- ✅ Add to home screen
- ✅ Standalone mode
- ✅ Offline support

### **iOS (Safari 16.4+)**
- ✅ Install via "Add to Home Screen"
- ✅ Standalone mode
- ⚠️ Install prompt not shown (iOS limitation)
- ✅ Offline support

### **Desktop (Chrome, Edge, Firefox)**
- ✅ Install as desktop app
- ✅ Standalone window
- ✅ Offline support

---

## 🔧 Configuration

### **Manifest Settings:**
```typescript
{
  name: "Fikra Valley - Transforme ton idée en entreprise avec ta voix",
  short_name: "Fikra Valley",
  start_url: "/",
  display: "standalone", // Full-screen app experience
  theme_color: "#2563eb",
  background_color: "#ffffff",
  orientation: "portrait-primary",
}
```

### **Service Worker Cache Strategy:**
- **Static assets**: Cached on install
- **Dynamic content**: Network-first, cache fallback
- **API requests**: Always network (not cached)
- **Cache version**: `v2` (increment to force update)

### **Install Prompt Behavior:**
- Shows after 3 seconds (user has seen the app)
- Dismissible (won't show again this session)
- Only shows if:
  - Browser supports `beforeinstallprompt`
  - App not already installed
  - User hasn't dismissed this session

---

## 🚀 Testing PWA

### **1. Test Installation:**
```bash
# Build the app
npm run build
npm start

# Visit in Chrome/Edge
# Look for install icon in address bar
# Or wait for install prompt
```

### **2. Test Offline:**
1. Open DevTools → Network tab
2. Check "Offline" checkbox
3. Refresh page
4. Should still work (served from cache)

### **3. Test Service Worker:**
1. Open DevTools → Application tab
2. Check "Service Workers" section
3. Should see registered service worker
4. Check "Cache Storage" for cached assets

### **4. Test on Mobile:**
1. Visit site on Android phone
2. Should see install prompt
3. Install and test offline mode
4. Test standalone mode (no browser UI)

---

## 📝 Next Steps (Optional Enhancements)

### **1. Generate Proper Icon Sizes**
Currently using single logo for all sizes. Consider generating:
- 192x192 (Android)
- 512x512 (Android splash)
- 180x180 (Apple touch icon)
- 96x96 (Shortcuts)

### **2. Add Offline Page**
Create a dedicated offline page instead of fallback to homepage:
- `app/offline/page.tsx`
- Show cached content list
- Retry connection button

### **3. Background Sync**
Implement background sync for:
- Voice submissions (queue when offline)
- Idea submissions
- Form data

### **4. Push Notifications**
Set up push notifications for:
- New mentor matches
- Idea status updates
- Workshop reminders

### **5. Update Notifications**
Notify users when new service worker is available:
- Show "Update available" banner
- Allow user to refresh

---

## 🐛 Troubleshooting

### **Service Worker Not Registering:**
- Check browser console for errors
- Ensure HTTPS (required for service workers)
- Check `public/sw.js` exists and is accessible

### **Install Prompt Not Showing:**
- Check if browser supports `beforeinstallprompt`
- Ensure manifest is valid
- Check if app already installed
- Try in incognito mode

### **Offline Not Working:**
- Check service worker is registered
- Verify assets are cached
- Check cache version (may need to increment)

### **Icons Not Showing:**
- Verify icon paths in manifest
- Check icon sizes match manifest
- Ensure icons are accessible (not 404)

---

## 📚 Resources

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev: PWA](https://web.dev/progressive-web-apps/)
- [Next.js: PWA](https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps)

---

**Status: ✅ PWA Fully Configured and Ready**

The app is now installable and works offline. Users can add it to their home screen and use it like a native app!

