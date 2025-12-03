/**
 * Mobile Navigation Component
 * 
 * Hamburger menu for mobile devices
 * Bottom navigation bar for quick access
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Lightbulb, Users, Search, UserPlus, Plus, User } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  section?: 'founders' | 'mentors';
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navItems = [
    { href: '/', label: 'Accueil', icon: Home },
    // Founders Section
    { href: '/submit-voice', label: 'Soumettre', icon: Plus, section: 'founders' },
    { href: '/ideas', label: 'Idées', icon: Lightbulb, section: 'founders' },
    { href: '/founder', label: 'Fondateurs', icon: User, section: 'founders' },
    // Mentors Section
    { href: '/find-mentor', label: 'Trouver Mentor', icon: Search, section: 'mentors' },
    { href: '/become-mentor', label: 'Devenir Mentor', icon: UserPlus, section: 'mentors' },
  ];

  return (
    <>
      {/* Hamburger Button (Mobile Only) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-3 bg-white rounded-full shadow-lg border border-slate-200"
        aria-label="Menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-slate-900" />
        ) : (
          <Menu className="w-6 h-6 text-slate-900" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Slide-out Menu */}
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-out">
            <div className="p-6">
              {/* Close Button */}
              <div className="flex justify-end mb-8">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                  aria-label="Fermer"
                >
                  <X className="w-6 h-6 text-slate-900" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-4">
                {/* Home */}
                {navItems.filter(item => !item.section).map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-green-100 text-green-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {/* Founders Cluster */}
                <div className="pt-2">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Pour les Fondateurs
                  </div>
                  {navItems.filter(item => item.section === 'founders').map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-green-100 text-green-700 font-semibold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Mentors Cluster */}
                <div className="pt-2">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Pour les Mentors
                  </div>
                  {navItems.filter(item => item.section === 'mentors').map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-green-100 text-green-700 font-semibold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
                
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  const bottomNavItems = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/ideas', label: 'Idées', icon: Lightbulb },
    { href: '/submit-voice', label: 'Soumettre', icon: Plus },
    { href: '/founder', label: 'Fondateurs', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px] ${
                isActive
                  ? 'text-green-600'
                  : 'text-slate-600'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-green-600' : 'text-slate-600'}`} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 bg-green-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

