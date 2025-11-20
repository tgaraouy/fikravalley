/**
 * Example usage of HeroSection component
 * 
 * This file demonstrates how to integrate the animated hero section
 * into your Next.js pages.
 */

import HeroSection from './HeroSection';

export default function HeroExample() {
  return (
    <div className="min-h-screen">
      {/* The ALIVE Hero Section */}
      <HeroSection />
      
      {/* Rest of your page content below */}
      <section id="success-stories" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Success Stories
          </h2>
          <p className="text-center text-gray-600">
            Placeholder for success stories section
          </p>
        </div>
      </section>
      
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <p className="text-center text-gray-600">
            Placeholder for how it works section
          </p>
        </div>
      </section>
    </div>
  );
}

/**
 * To use in your page:
 * 
 * // app/page.tsx
 * import HeroSection from '@/components/hero/HeroSection';
 * 
 * export default function HomePage() {
 *   return (
 *     <main>
 *       <HeroSection />
 *       {/* Your other sections *\/}
 *     </main>
 *   );
 * }
 */

