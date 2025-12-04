'use client';

/**
 * Engaging Footer - Engagement Hub
 * 
 * Not just links - includes newsletter, quick actions,
 * live stats, and social proof.
 * 
 * Makes footer an active conversion/engagement zone.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { APP_TAGLINE } from '@/lib/constants/tagline';

export default function EngagingFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email) {
      setSubscribed(true);
      // TODO: Actually send to email service
    }
  };

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white pt-6 pb-4 overflow-hidden z-0">
      {/* Zellige Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: "url('/png/zillige.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <div className="relative z-0 max-w-7xl mx-auto px-4">
        
        {/* Compact Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          
          <div>
            <h4 className="font-bold mb-2 text-xs">Founder&apos;s Journey</h4>
            <ul className="space-y-1 text-gray-400 text-xs">
              <li><Link href="/submit-voice" className="hover:text-white transition-colors">Soumettre</Link></li>
              <li><Link href="/ideas" className="hover:text-white transition-colors">Idées</Link></li>
              <li><Link href="/founder" className="hover:text-white transition-colors">Fondateurs</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-2 text-xs">Mentors</h4>
            <ul className="space-y-1 text-gray-400 text-xs">
              <li><Link href="/find-mentor" className="hover:text-white transition-colors">Trouver Mentor</Link></li>
              <li><Link href="/become-mentor" className="hover:text-white transition-colors">Devenir Mentor</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-2 text-xs">Ressources</h4>
            <ul className="space-y-1 text-gray-400 text-xs">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">CGU</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-2 text-xs">Contact</h4>
            <ul className="space-y-1 text-gray-400 text-xs">
              <li><Link href="/submit-voice" className="hover:text-white transition-colors">Support</Link></li>
              <li><Link href="/become-mentor" className="hover:text-white transition-colors">Rejoindre</Link></li>
            </ul>
          </div>
          
        </div>
        
        {/* Social + Bottom - Compact */}
        <div className="border-t border-white/10 pt-4 flex flex-col md:flex-row justify-between items-center gap-3">
          
          {/* Logo + Tagline */}
          <div className="text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-1">
              <Logo href="/" size="sm" showText={true} />
              <p className="text-xs text-gray-400">
                {APP_TAGLINE.transformation?.fr || 'Idée → Réalité'}
              </p>
            </div>
          </div>
          
          {/* Social Icons */}
          <div className="flex gap-2">
            <SocialIcon icon="in" label="LinkedIn" href="https://linkedin.com/company/fikravalley" />
            <SocialIcon icon="𝕏" label="Twitter" href="https://twitter.com/fikravalley" />
            <SocialIcon icon="f" label="Facebook" href="https://facebook.com/fikravalley" />
            <SocialIcon icon="ig" label="Instagram" href="https://instagram.com/fikravalley" />
          </div>
          
          {/* Legal */}
          <div className="text-xs text-gray-400 flex flex-wrap justify-center gap-3">
            <Link href="/privacy" className="hover:text-white">Confidentialité</Link>
            <Link href="/terms" className="hover:text-white">CGU</Link>
            <Link href="/privacy" className="hover:text-white">Cookies</Link>
          </div>
          
        </div>
        
        {/* Copyright */}
        <div className="text-center text-xs text-gray-500 mt-3">
          © 2025 Fikra Valley. Fait avec ❤️ au Maroc 🇲🇦
        </div>
        
      </div>
      
    </footer>
  );
}

// Quick Action Card
interface QuickActionCardProps {
  icon: string;
  label: string;
  href: string;
}

function QuickActionCard({ icon, label, href }: QuickActionCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-lg border-2 border-white/20 hover:border-orange-500 transition-all text-center min-h-[100px] sm:min-h-[120px]"
      >
        <div className="text-2xl sm:text-3xl mb-2">{icon}</div>
        <div className="text-xs sm:text-sm font-semibold">{label}</div>
      </motion.div>
    </Link>
  );
}


// Social Icon
interface SocialIconProps {
  icon: string;
  label: string;
  href: string;
}

function SocialIcon({ icon, label, href }: SocialIconProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.2, rotate: 5 }}
      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold hover:bg-orange-500 transition-colors"
      aria-label={label}
    >
      {icon}
    </motion.a>
  );
}

