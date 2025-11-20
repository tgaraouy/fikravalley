'use client';

/**
 * Social Proof Wall - Dynamic Success Stories
 * 
 * Pinterest-style masonry grid showing REAL success stories with
 * photos, videos, and testimonials. Instagram meets LinkedIn.
 * 
 * Psychology: Identification + Credibility + FOMO + Aspiration
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Masonry from 'react-masonry-css';
import PhotoCard from './cards/PhotoCard';
import VideoCard from './cards/VideoCard';
import BeforeAfterCard from './cards/BeforeAfterCard';
import SocialEmbedCard from './cards/SocialEmbedCard';
import MilestoneCard from './cards/MilestoneCard';

export interface Story {
  id: string;
  type: 'photo' | 'video' | 'before_after' | 'social' | 'milestone';
  status: 'funded' | 'launched' | 'qualified';
  user: {
    name: string;
    location: string;
    photo: string;
    idea: string;
  };
  data: any;
}

// Mock success stories (replace with real data from API)
const successStories: Story[] = [
  {
    id: '1',
    type: 'photo',
    status: 'funded',
    user: {
      name: 'Youssef El Fassi',
      location: 'Fès',
      photo: 'https://i.pravatar.cc/400?img=12',
      idea: 'EduDarija - Cours en ligne en Darija'
    },
    data: {
      quote: "Fikra Valley m'a aidé à collecter 127 reçus. Maintenant j'ai 80,000 DH d'Intilaka!",
      stats: {
        receipts: 127,
        score: 31,
        funding: '80,000 DH'
      }
    }
  },
  {
    id: '2',
    type: 'milestone',
    status: 'launched',
    user: {
      name: 'Amina Bennani',
      location: 'Casablanca',
      photo: 'https://i.pravatar.cc/400?img=45',
      idea: 'RFID Hospital Tracker'
    },
    data: {
      number: 127,
      unit: 'reçus',
      achievement: 'Record de Validation',
      timeframe: '3 semaines',
      color: 'green',
      icon: '🎯',
      description: 'En seulement 3 semaines, collecté 127 conversations validées'
    }
  },
  {
    id: '3',
    type: 'before_after',
    status: 'funded',
    user: {
      name: 'Karim Idrissi',
      location: 'Rabat',
      photo: 'https://i.pravatar.cc/400?img=33',
      idea: 'AgriConnect - Plateforme pour agriculteurs'
    },
    data: {
      before: {
        score: 12,
        receipts: 0,
        status: 'Bloqué'
      },
      after: {
        score: 29,
        receipts: 73,
        status: 'Financé',
        funding: '50,000 DH'
      },
      timeframe: '9 semaines'
    }
  },
  {
    id: '4',
    type: 'photo',
    status: 'qualified',
    user: {
      name: 'Fatima Zahra',
      location: 'Marrakech',
      photo: 'https://i.pravatar.cc/400?img=47',
      idea: 'MarocTourism AI - Guide intelligent'
    },
    data: {
      quote: "Passée de 0 à qualifié en 6 semaines grâce au FIKRA agent!",
      stats: {
        receipts: 52,
        score: 26,
        funding: 'En attente'
      }
    }
  },
  {
    id: '5',
    type: 'social',
    status: 'launched',
    user: {
      name: 'Ahmed Tazi',
      location: 'Casablanca',
      photo: 'https://i.pravatar.cc/400?img=60',
      idea: 'CleanTech Maroc'
    },
    data: {
      platform: 'linkedin',
      postText: "Fier d'annoncer que CleanTech Maroc a levé 100,000 DH grâce à Fikra Valley! 🚀 Le parcours était intense mais le support était exceptionnel. Merci à toute l'équipe!",
      likes: 247,
      comments: 34,
      date: 'Il y a 2 jours'
    }
  },
  {
    id: '6',
    type: 'milestone',
    status: 'funded',
    user: {
      name: 'Sara Bennis',
      location: 'Tanger',
      photo: 'https://i.pravatar.cc/400?img=26',
      idea: 'HealthTrack Maroc'
    },
    data: {
      number: 31,
      unit: '/50',
      achievement: 'Score Exceptionnel',
      timeframe: '8 semaines',
      color: 'blue',
      icon: '🏆',
      description: 'Top 5% des idées sur Fikra Valley'
    }
  },
  {
    id: '7',
    type: 'photo',
    status: 'funded',
    user: {
      name: 'Omar Alami',
      location: 'Agadir',
      photo: 'https://i.pravatar.cc/400?img=51',
      idea: 'FishTech - Traçabilité poisson'
    },
    data: {
      quote: "De l'idée au financement en 12 semaines. Incroyable!",
      stats: {
        receipts: 89,
        score: 28,
        funding: '60,000 DH'
      }
    }
  },
  {
    id: '8',
    type: 'before_after',
    status: 'launched',
    user: {
      name: 'Leila Mansouri',
      location: 'Fès',
      photo: 'https://i.pravatar.cc/400?img=38',
      idea: 'Artisan Connect'
    },
    data: {
      before: {
        score: 8,
        receipts: 0,
        status: 'Confus'
      },
      after: {
        score: 32,
        receipts: 156,
        status: 'Lancé',
        funding: '100,000 DH'
      },
      timeframe: '14 semaines'
    }
  },
  {
    id: '9',
    type: 'milestone',
    status: 'funded',
    user: {
      name: 'Hassan Nejjar',
      location: 'Meknès',
      photo: 'https://i.pravatar.cc/400?img=13',
      idea: 'EcoPlast Solutions'
    },
    data: {
      number: 200,
      unit: 'reçus',
      achievement: 'Market Proven',
      timeframe: '6 semaines',
      color: 'purple',
      icon: '🌟',
      description: 'Top 1% - Preuve de marché exceptionnelle'
    }
  },
  {
    id: '10',
    type: 'social',
    status: 'qualified',
    user: {
      name: 'Nadia Chraibi',
      location: 'Rabat',
      photo: 'https://i.pravatar.cc/400?img=44',
      idea: 'EdTech Kids'
    },
    data: {
      platform: 'twitter',
      postText: "Just qualified for @IntilakaMa funding through @FikraValley! 🎉 Score: 27/50. The journey from problem to qualification was smooth thanks to the FIKRA agent. If you have an idea, try it!",
      likes: 89,
      comments: 12,
      date: 'Il y a 5 jours'
    }
  },
  {
    id: '11',
    type: 'photo',
    status: 'launched',
    user: {
      name: 'Mehdi Tahiri',
      location: 'Oujda',
      photo: 'https://i.pravatar.cc/400?img=67',
      idea: 'TransportSmart'
    },
    data: {
      quote: "Lancé il y a 3 mois, déjà 500 utilisateurs actifs!",
      stats: {
        receipts: 143,
        score: 30,
        funding: '80,000 DH'
      }
    }
  },
  {
    id: '12',
    type: 'milestone',
    status: 'funded',
    user: {
      name: 'Zineb Kadiri',
      location: 'Casablanca',
      photo: 'https://i.pravatar.cc/400?img=29',
      idea: 'WomenTech Hub'
    },
    data: {
      number: 80000,
      unit: 'DH',
      achievement: 'Financé!',
      timeframe: '10 semaines',
      color: 'orange',
      icon: '💰',
      description: 'Financement Intilaka obtenu'
    }
  }
];

export default function SocialProofWall() {
  const [filter, setFilter] = useState<'all' | 'funded' | 'launched' | 'qualified'>('all');
  const [visibleCount, setVisibleCount] = useState(12);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const filteredStories = successStories.filter(story => 
    filter === 'all' || story.status === filter
  );

  const visibleStories = filteredStories.slice(0, visibleCount);
  const hasMore = visibleCount < filteredStories.length;

  const breakpointColumns = {
    default: 4,
    1536: 3,
    1024: 2,
    640: 1
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
      
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold mb-4">
            <span>💡</span>
            <span>IDÉES EN LUMIÈRE</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
            Les idées les plus{' '}
            <span className="text-orange-500">prometteuses</span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Idées analysées avec les meilleurs scores de faisabilité. 
            En cours d'évaluation pour la sélection.
          </p>
          
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-4">
            {[
              { value: 'all', label: 'Tous', icon: '' },
              { value: 'funded', label: 'Financés', icon: '💰' },
              { value: 'launched', label: 'Lancés', icon: '🚀' },
              { value: 'qualified', label: 'Qualifiés', icon: '✅' }
            ].map(f => (
              <button
                key={f.value}
                onClick={() => {
                  setFilter(f.value as any);
                  setVisibleCount(12);
                }}
                className={`
                  px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all text-sm sm:text-base
                  ${filter === f.value 
                    ? 'bg-orange-500 text-white shadow-lg' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }
                `}
              >
                {f.icon && <span className="mr-1">{f.icon}</span>}
                {f.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Masonry Grid */}
        <Masonry
          breakpointCols={breakpointColumns}
          className="flex -ml-4 sm:-ml-6 w-auto"
          columnClassName="pl-4 sm:pl-6 bg-clip-padding"
        >
          <AnimatePresence mode="popLayout">
            {visibleStories.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  delay: i * 0.05,
                  duration: 0.3
                }}
                className="mb-4 sm:mb-6"
              >
                <StoryCard 
                  story={story}
                  isExpanded={expandedCard === story.id}
                  onClick={() => setExpandedCard(expandedCard === story.id ? null : story.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </Masonry>
        
        {/* Load More */}
        {hasMore && (
          <div className="text-center mt-8 sm:mt-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadMore}
              className="px-6 sm:px-8 py-3 border-2 border-gray-300 rounded-lg font-bold hover:border-orange-500 hover:text-orange-500 transition-all text-sm sm:text-base"
            >
              Voir toutes les idées →
            </motion.button>
          </div>
        )}
        
        {!hasMore && filteredStories.length > 0 && (
          <div className="text-center mt-8 sm:mt-12 text-gray-500 font-medium text-sm sm:text-base">
            ✅ Toutes les idées affichées
          </div>
        )}
        
        {filteredStories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucune idée trouvée pour ce filtre
          </div>
        )}
        
      </div>
      
    </section>
  );
}

// Story Card Component
interface StoryCardProps {
  story: Story;
  isExpanded: boolean;
  onClick: () => void;
}

function StoryCard({ story, isExpanded, onClick }: StoryCardProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden bg-white"
    >
      {story.type === 'photo' && <PhotoCard story={story} isExpanded={isExpanded} />}
      {story.type === 'video' && (
        <VideoCard 
          story={story} 
          isPlaying={isVideoPlaying}
          setIsPlaying={setIsVideoPlaying}
        />
      )}
      {story.type === 'before_after' && <BeforeAfterCard story={story} />}
      {story.type === 'social' && <SocialEmbedCard story={story} />}
      {story.type === 'milestone' && <MilestoneCard story={story} />}
    </motion.div>
  );
}

