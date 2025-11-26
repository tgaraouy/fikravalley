/**
 * Enhanced Navigation Menu Component
 * 
 * Conditionally shows admin/mentor links based on user role
 */

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Home, 
  Lightbulb, 
  Mic, 
  Users, 
  Settings, 
  TestTube,
  Shield,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function NavigationMenu() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMentor, setIsMentor] = useState(false);

  useEffect(() => {
    // Check if user is admin (you can implement your own logic)
    if (user?.email) {
      // Example: Check admin status from user metadata or API
      // For now, we'll check if email contains 'admin' or check via API
      const checkUserRole = async () => {
        try {
          // You can add an API call here to check user roles
          // For now, using simple email check
          setIsAdmin(user.email?.includes('admin') || false);
          setIsMentor(user.email?.includes('mentor') || false);
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error checking user role:', error);
          }
        }
      };
      checkUserRole();
    }
  }, [user]);

  const mainLinks = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/ideas', label: 'Idées', icon: Lightbulb },
    { href: '/submit-voice', label: 'Soumettre', icon: Mic },
    { href: '/find-mentor', label: 'Trouver Mentor', icon: Users },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Admin', icon: Shield },
    { href: '/admin/mentor-matches', label: 'Mentor Matches', icon: UserCheck },
  ];

  const mentorLinks = [
    { href: '/mentor/dashboard', label: 'Mes Matches', icon: UserCheck },
  ];

  const devLinks = [
    { href: '/test-all', label: '🧪 Test', icon: TestTube },
  ];

  return (
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 gap-6">
        <div className="flex items-center flex-shrink-0 gap-3">
          <Link href="/" className="text-xl font-bold text-slate-900">
            Fikra Valley
          </Link>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-end">
          {/* Main Links */}
          {mainLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="hidden sm:flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Admin Links (if admin) */}
          {isAdmin && adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="hidden md:flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Mentor Links (if mentor) */}
          {isMentor && mentorLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="hidden md:flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Dev Links (always visible in dev) */}
          {process.env.NODE_ENV === 'development' && devLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="hidden md:flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

