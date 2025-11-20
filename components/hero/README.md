# 🚀 Fikra Valley Hero Section

A fully animated, **ALIVE** hero section with real-time statistics, smooth animations, and engaging interactions.

## ✨ Features

### 1. **Animated Hero Text**
- Word-by-word reveal animation
- Orange gradient text (brand colors)
- Smooth bounce effect on each word
- Fully responsive typography

### 2. **Living Statistics Cards**
Four glassmorphism cards with real-time updates:

| Card | Update Interval | Animation |
|------|----------------|-----------|
| 💡 Ideas Submitted | Every 30s | Scale pulse |
| 💰 Receipts Collected | Every 10s | Icon bounce |
| ✅ Qualified Ideas | Every 2 mins | Glow effect |
| 🏆 Funding Secured | Every 1 min | Number count up |

**Card Features:**
- Glassmorphism effect (backdrop-blur + transparency)
- Colored shadows matching icon theme
- Hover effects: Lift 8px, rotate 1deg, scale 1.02
- Smooth counting animations
- Responsive grid layout (4 cols desktop, 2 cols tablet, 1 col mobile)

### 3. **Live Activity Ticker**
Real-time scrolling feed of platform activity:
- Auto-scrolls right to left (50px/second)
- Pauses on hover
- Seamless infinite loop
- Animated icons
- Updates every 30 seconds with new activities
- 6 activity types:
  - 🎉 Qualified for funding
  - 💰 Receipt collected
  - 🧠 Score improved
  - 🎓 Mentor matched
  - ✨ Document generated
  - 🚀 Idea launched

### 4. **CTAs with Interactions**
- **Primary Button:** "Tester mon Idée Gratuitement"
  - Orange gradient background
  - Confetti burst on click
  - Scale + rotate hover effect
  - Navigates to /submit

- **Secondary Button:** "Voir les Success Stories"
  - Outline style
  - Smooth hover fill
  - Border color transition
  - Scrolls to success stories section

### 5. **Background Animations**
- 20 floating particles with random motion
- 2 large gradient orbs with pulsing effect
- Smooth, performant 60fps animations
- Low opacity to not distract from content

## 📦 Installation

### Required Dependencies

```bash
npm install framer-motion canvas-confetti
```

### Package Versions

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "canvas-confetti": "^1.9.2"
  }
}
```

## 🎯 Usage

### Basic Integration

```tsx
import HeroSection from '@/components/hero/HeroSection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      {/* Rest of your page */}
    </main>
  );
}
```

### With Custom Stats (Real WebSocket Data)

```tsx
'use client';

import HeroSection from '@/components/hero/HeroSection';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [realTimeStats, setRealTimeStats] = useState(null);
  
  useEffect(() => {
    // Connect to your WebSocket
    const ws = new WebSocket('wss://your-api.com/stats');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setRealTimeStats(data);
    };
    
    return () => ws.close();
  }, []);
  
  return (
    <main>
      <HeroSection initialStats={realTimeStats} />
    </main>
  );
}
```

## 🎨 Customization

### Colors

The component uses Tailwind CSS classes. Customize by modifying:

```tsx
// Primary brand color (Orange)
from-orange-500 to-orange-600

// Card accent colors
shadow-yellow-500/20  // Ideas
shadow-green-500/20   // Receipts
shadow-blue-500/20    // Qualified
shadow-amber-500/20   // Funding
```

### Animation Speeds

Adjust in the component:

```tsx
// Ticker scroll speed
transition={{ x: { duration: 30 } }}  // Slower = higher number

// Stat update intervals
const receiptsInterval = setInterval(() => {}, 10000);  // 10 seconds
const ideasInterval = setInterval(() => {}, 30000);     // 30 seconds
```

### Text Content

Modify directly in the component:

```tsx
<AnimatedText 
  text="Your Custom Hero Text Here" 
  className="..."
/>

<motion.p>
  Your custom subtitle
</motion.p>
```

## 🎭 Animations

### Performance Optimized

All animations use:
- **GPU-accelerated properties:** `transform`, `opacity`
- **No layout thrashing:** Avoid `width`, `height`, `left`, `top`
- **Will-change hints:** For smooth transitions
- **RequestAnimationFrame:** For counting animations

### Animation Types

1. **Word-by-word reveal** (Hero text)
   - Stagger delay: 0.1s per word
   - Easing: Cubic bezier [0.22, 1, 0.36, 1]

2. **Number counting** (Stat cards)
   - Duration: 2s
   - Steps: 60 (smooth increments)
   - Easing: Linear

3. **Ticker scroll** (Activity feed)
   - Type: Infinite transform translateX
   - Easing: Linear
   - Pause on hover

4. **Background particles**
   - 20 individual animations
   - Random delays and durations
   - Continuous loop

## 📱 Responsive Design

| Breakpoint | Layout | Text Size |
|------------|--------|-----------|
| **Mobile** (< 640px) | Stack 1 col | 48px (text-5xl) |
| **Tablet** (640-1024px) | Grid 2 cols | 56px (text-6xl) |
| **Desktop** (> 1024px) | Grid 4 cols | 72px (text-7xl) |

## ♿ Accessibility

- ✅ Keyboard navigation supported
- ✅ Semantic HTML structure
- ✅ ARIA labels on interactive elements
- ✅ Focus visible states
- ✅ Reduced motion support (respects prefers-reduced-motion)

### Add Reduced Motion Support

```tsx
import { useReducedMotion } from 'framer-motion';

const shouldReduceMotion = useReducedMotion();

<motion.div
  animate={shouldReduceMotion ? {} : { scale: [1, 1.2, 1] }}
  // ...
/>
```

## 🧪 Testing Checklist

- [ ] Numbers count up smoothly on page load
- [ ] Stats update at specified intervals
- [ ] Ticker scrolls smoothly without jank (60fps)
- [ ] Ticker pauses on hover
- [ ] Cards lift and rotate on hover
- [ ] Primary CTA triggers confetti
- [ ] CTA navigates correctly
- [ ] Responsive on mobile (stacks properly)
- [ ] Animations are 60fps
- [ ] No Cumulative Layout Shift (CLS)
- [ ] Works with reduced motion preferences
- [ ] Accessible via keyboard
- [ ] Screen reader friendly

## 🎬 Demo Animations

### On Page Load
1. Hero text animates word-by-word (0-1s)
2. Subtitle fades in (0.5-1.3s)
3. Stat cards fade up in sequence (0.6-1.2s)
4. Numbers count from 0 to target (1-3s)
5. Ticker fades in and starts scrolling (0.8s)
6. CTAs become interactive (1s)

### Continuous Animations
- Background particles float continuously
- Gradient orbs pulse every 8-10s
- Card icons pulse every 2s
- Activity icons rotate/scale every 3s
- Ticker auto-scrolls infinitely

### User Interactions
- Hover card → Lift, scale, rotate (300ms)
- Hover ticker → Pause scrolling (instant)
- Click primary CTA → Confetti burst + navigate (500ms)
- Click secondary CTA → Smooth scroll to section (800ms)

## 🔧 Troubleshooting

### Issue: Animations are janky
**Solution:** Ensure GPU acceleration is enabled
```tsx
className="will-change-transform"
```

### Issue: Confetti doesn't work
**Solution:** Check canvas-confetti is installed
```bash
npm install canvas-confetti
npm install --save-dev @types/canvas-confetti
```

### Issue: Numbers don't update
**Solution:** Verify useEffect cleanup
```tsx
useEffect(() => {
  const interval = setInterval(() => {}, 10000);
  return () => clearInterval(interval); // Important!
}, []);
```

### Issue: Layout shifts on load
**Solution:** Set explicit heights
```tsx
className="min-h-[200px]" // Prevents CLS
```

## 📊 Performance Metrics

Target Metrics:
- **First Contentful Paint (FCP):** < 1.8s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms
- **Animation FPS:** 60fps (16.67ms per frame)

## 🎨 Design Tokens

```typescript
const colors = {
  primary: {
    orange: { from: '#f97316', to: '#ea580c' },
    yellow: '#fbbf24',
    green: '#10b981',
    blue: '#3b82f6',
    gold: '#f59e0b'
  },
  background: {
    gradient: 'from-white via-blue-50 to-purple-50'
  }
};

const spacing = {
  cardGap: '1.5rem', // gap-6
  cardPadding: '2rem', // p-8
  sectionPadding: '5rem', // py-20
};

const shadows = {
  card: 'shadow-xl',
  cardHover: 'shadow-2xl',
  colored: {
    yellow: 'shadow-yellow-500/20',
    green: 'shadow-green-500/20',
    blue: 'shadow-blue-500/20',
    gold: 'shadow-amber-500/20'
  }
};
```

## 🚀 Production Checklist

Before deploying:

1. **Replace mock data with real API**
   ```tsx
   // Replace generateRandomActivity() with:
   const { data } = await fetch('/api/activities');
   setActivities(data);
   ```

2. **Add WebSocket connection**
   ```tsx
   const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);
   ws.onmessage = (event) => {
     const data = JSON.parse(event.data);
     setStats(data.stats);
   };
   ```

3. **Implement analytics tracking**
   ```tsx
   onClick={() => {
     analytics.track('hero_cta_clicked');
     handlePrimaryCTA();
   }}
   ```

4. **Add error boundaries**
   ```tsx
   <ErrorBoundary fallback={<HeroFallback />}>
     <HeroSection />
   </ErrorBoundary>
   ```

5. **Optimize images/assets**
   - Use next/image for icons
   - Lazy load below-the-fold content
   - Preload critical assets

---

**Built with 💡 by Fikra Valley Team**

**Philosophy:** "Make it FEEL alive, not just look alive"

