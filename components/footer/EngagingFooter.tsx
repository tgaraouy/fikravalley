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
    <footer className="bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white pt-12 sm:pt-16 md:pt-20 pb-10">
      
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Top Section: Newsletter + Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 mb-12 sm:mb-16">
          
          {/* Newsletter */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Restez inspiré 💡
            </h3>
            <p className="text-gray-300 mb-6 text-sm sm:text-base">
              Recevez chaque semaine une success story + conseils de validation.
            </p>
            
            {!subscribed ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border-2 border-white/20 focus:border-orange-500 outline-none text-white placeholder-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubscribe}
                  className="px-6 py-3 bg-orange-500 rounded-lg font-bold hover:bg-orange-600 transition-colors whitespace-nowrap"
                >
                  S'abonner
                </motion.button>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-3 p-4 bg-green-500/20 border-2 border-green-500 rounded-lg"
              >
                <span className="text-2xl sm:text-3xl">✓</span>
                <span className="font-semibold text-sm sm:text-base">Merci! Premier email en route 📬</span>
              </motion.div>
            )}
            
            <div className="mt-4 text-xs sm:text-sm text-gray-400">
              Rejoignez 2,347 innovateurs. Désabonnement en 1 clic.
            </div>
          </div>
          
          {/* Quick Actions */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-6">
              Actions rapides ⚡
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <QuickActionCard
                icon="🚀"
                label="Soumettre une idée"
                href="/submit"
              />
              <QuickActionCard
                icon="📖"
                label="Success stories"
                href="/ideas"
              />
              <QuickActionCard
                icon="🎓"
                label="Trouver un mentor"
                href="/submit"
              />
              <QuickActionCard
                icon="💰"
                label="Voir financements"
                href="/submit"
              />
            </div>
          </div>
          
        </div>
        
        {/* Live Stats Bar */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-8 sm:mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
            <LiveStat icon="💡" value="1,247" label="Idées soumises" />
            <LiveStat icon="✅" value="347" label="Qualifiées" />
            <LiveStat icon="💰" value="28" label="Financées" />
            <LiveStat icon="👥" value="2.3K" label="Entrepreneurs" />
          </div>
        </div>
        
        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          
          <div>
            <h4 className="font-bold mb-4 text-sm sm:text-base">Plateforme</h4>
            <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
              <li><Link href="/submit" className="hover:text-white transition-colors">Comment ça marche</Link></li>
              <li><Link href="/submit" className="hover:text-white transition-colors">Tarifs (Gratuit!)</Link></li>
              <li><Link href="/ideas" className="hover:text-white transition-colors">Success Stories</Link></li>
              <li><Link href="/submit" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-sm sm:text-base">Ressources</h4>
            <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
              <li><Link href="/submit" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/submit" className="hover:text-white transition-colors">Guides</Link></li>
              <li><Link href="/submit" className="hover:text-white transition-colors">Templates</Link></li>
              <li><Link href="/submit" className="hover:text-white transition-colors">Événements</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-sm sm:text-base">Communauté</h4>
            <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
              <li><Link href="/submit" className="hover:text-white transition-colors">Mentors</Link></li>
              <li><Link href="/submit" className="hover:text-white transition-colors">Partenaires</Link></li>
              <li><Link href="/submit" className="hover:text-white transition-colors">Investisseurs</Link></li>
              <li><Link href="/submit" className="hover:text-white transition-colors">Forum</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-sm sm:text-base">À propos</h4>
            <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
              <li><Link href="/submit" className="hover:text-white transition-colors">Notre mission</Link></li>
              <li><Link href="/submit" className="hover:text-white transition-colors">L'équipe</Link></li>
              <li><Link href="/submit" className="hover:text-white transition-colors">Carrières</Link></li>
              <li><Link href="/submit" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          
        </div>
        
        {/* Social + Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Logo + Tagline */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
              <Logo href="/" size="md" showText={true} />
            </div>
            <div className="text-xs sm:text-sm text-gray-400">
              Transformer les idées marocaines en réalité
            </div>
          </div>
          
          {/* Social Icons */}
          <div className="flex gap-4">
            <SocialIcon icon="in" label="LinkedIn" href="https://linkedin.com/company/fikravalley" />
            <SocialIcon icon="𝕏" label="Twitter" href="https://twitter.com/fikravalley" />
            <SocialIcon icon="f" label="Facebook" href="https://facebook.com/fikravalley" />
            <SocialIcon icon="ig" label="Instagram" href="https://instagram.com/fikravalley" />
          </div>
          
          {/* Legal */}
          <div className="text-xs sm:text-sm text-gray-400 flex flex-wrap justify-center gap-4">
            <Link href="/privacy" className="hover:text-white">Confidentialité</Link>
            <Link href="/terms" className="hover:text-white">CGU</Link>
            <Link href="/privacy" className="hover:text-white">Cookies</Link>
          </div>
          
        </div>
        
        {/* Copyright */}
        <div className="text-center text-xs sm:text-sm text-gray-500 mt-8">
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

// Live Stat
interface LiveStatProps {
  icon: string;
  value: string;
  label: string;
}

function LiveStat({ icon, value, label }: LiveStatProps) {
  return (
    <div>
      <div className="text-2xl sm:text-3xl mb-2">{icon}</div>
      <motion.div
        key={value}
        initial={{ scale: 1.2, color: '#f97316' }}
        animate={{ scale: 1, color: '#ffffff' }}
        className="text-2xl sm:text-3xl font-bold mb-1"
      >
        {value}
      </motion.div>
      <div className="text-xs sm:text-sm text-gray-400">{label}</div>
    </div>
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

