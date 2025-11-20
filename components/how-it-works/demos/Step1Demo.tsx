'use client';

/**
 * Step 1 Demo: FIKRA Agent Conversation
 * 
 * Simulates a real conversation with the FIKRA validation agent.
 * Shows gap detection, intimacy scoring, and Socratic questioning.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  type: 'agent' | 'user';
  text: string;
  delay: number;
  typing?: boolean;
  highlight?: boolean;
  scoreUpdate?: {
    from: number;
    to: number;
    label: string;
  };
}

const conversationFlow: Message[] = [
  { 
    type: 'agent', 
    text: 'Ahlan! 🙋‍♂️ Commençons. Quel problème essayez-vous de résoudre?', 
    delay: 500 
  },
  { 
    type: 'user', 
    text: 'Les étudiants en 2ème Bac n\'ont pas accès à des cours en darija...', 
    delay: 2000, 
    typing: true 
  },
  { 
    type: 'agent', 
    text: 'Interessant! Shkoun b zzabt li 3andu had l-mochkil? 🤔', 
    delay: 1500 
  },
  { 
    type: 'user', 
    text: 'Les étudiants de familles modestes qui ne parlent pas bien français', 
    delay: 2500, 
    typing: true,
    highlight: true
  },
  { 
    type: 'agent', 
    text: 'Mizyan! ✅ Clarity +2 points', 
    delay: 1000,
    scoreUpdate: { from: 3, to: 5, label: 'Clarity' }
  },
  { 
    type: 'agent', 
    text: 'Wach nta 3echt had l-mochkil personally?', 
    delay: 1500 
  },
  { 
    type: 'user', 
    text: 'Oui! J\'étais dans cette situation en 2018. Mon père ne parlait que darija...', 
    delay: 2500, 
    typing: true,
    highlight: true
  },
  { 
    type: 'agent', 
    text: 'Perfect! 🎯 Intimacy +3 points (TRUE KNOWING)', 
    delay: 1000,
    scoreUpdate: { from: 5, to: 8, label: 'Intimacy' }
  },
  { 
    type: 'agent', 
    text: 'Excellent! Vous avez vécu le problème. Locke approves! 📚', 
    delay: 1500 
  }
];

export default function Step1Demo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [intimacyScore, setIntimacyScore] = useState(3);
  const [isTyping, setIsTyping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || currentIndex >= conversationFlow.length) return;

    const currentMessage = conversationFlow[currentIndex];
    
    const timer = setTimeout(() => {
      if (currentMessage.typing) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, currentMessage]);
          
          if (currentMessage.scoreUpdate) {
            setIntimacyScore(currentMessage.scoreUpdate.to);
          }
          
          setCurrentIndex(prev => prev + 1);
        }, 1500);
      } else {
        setMessages(prev => [...prev, currentMessage]);
        
        if (currentMessage.scoreUpdate) {
          setIntimacyScore(currentMessage.scoreUpdate.to);
        }
        
        setCurrentIndex(prev => prev + 1);
      }
    }, currentMessage.delay);

    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying]);

  const handleRestart = () => {
    setMessages([]);
    setCurrentIndex(0);
    setIntimacyScore(3);
    setIsTyping(false);
    setIsPlaying(true);
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold">
            F
          </div>
          <div>
            <div className="font-bold text-sm">FIKRA Agent</div>
            <div className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>En ligne</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleRestart}
          className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          🔄 Rejouer
        </button>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-thin">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} index={i} />
          ))}
        </AnimatePresence>
        
        {isTyping && <TypingIndicator />}
      </div>
      
      {/* Intimacy Score Widget */}
      <IntimacyScoreWidget score={intimacyScore} />
      
      {/* Input (disabled, for show) */}
      <div className="flex gap-2 mt-3">
        <input
          disabled
          placeholder="Votre réponse apparaîtra automatiquement..."
          className="flex-1 px-3 py-2 text-sm border rounded-lg bg-gray-50 text-gray-400"
        />
        <button disabled className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm opacity-50">
          Envoyer
        </button>
      </div>
    </div>
  );
}

// Chat Bubble Component
function ChatBubble({ message, index }: { message: Message; index: number }) {
  const isAgent = message.type === 'agent';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: isAgent ? -20 : 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={`
          max-w-[80%] px-4 py-2 rounded-2xl text-sm
          ${isAgent 
            ? 'bg-orange-100 text-orange-900 rounded-tl-none' 
            : 'bg-blue-500 text-white rounded-tr-none'
          }
          ${message.highlight ? 'ring-2 ring-green-400 ring-offset-2' : ''}
        `}
      >
        {message.text}
        
        {message.scoreUpdate && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="mt-2 pt-2 border-t border-orange-200 flex items-center gap-2"
          >
            <span className="text-xs font-bold">{message.scoreUpdate.label}:</span>
            <span className="text-xs">{message.scoreUpdate.from}</span>
            <span className="text-xs">→</span>
            <span className="text-xs font-bold text-green-600">{message.scoreUpdate.to}</span>
            <span className="text-xs">✨</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Typing Indicator
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="flex justify-start"
    >
      <div className="bg-orange-100 px-4 py-3 rounded-2xl rounded-tl-none">
        <div className="flex gap-1">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
            className="w-2 h-2 rounded-full bg-orange-400"
          />
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
            className="w-2 h-2 rounded-full bg-orange-400"
          />
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
            className="w-2 h-2 rounded-full bg-orange-400"
          />
        </div>
      </div>
    </motion.div>
  );
}

// Intimacy Score Widget
function IntimacyScoreWidget({ score }: { score: number }) {
  return (
    <motion.div
      layout
      className="p-3 bg-purple-50 rounded-lg border border-purple-200"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-purple-900">Intimacy Score (Locke)</span>
        <span className="text-sm font-bold text-purple-600">{score}/10</span>
      </div>
      
      <div className="flex gap-1">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ 
              scale: i < score ? 1 : 0.3,
              backgroundColor: i < score ? '#9333ea' : '#e5e7eb'
            }}
            transition={{ delay: i * 0.05 }}
            className="flex-1 h-2 rounded-full"
          />
        ))}
      </div>
      
      <div className="mt-2 text-xs text-purple-700">
        {score < 5 && 'Knowing OF → Keep going!'}
        {score >= 5 && score < 8 && 'Getting intimate...'}
        {score >= 8 && '✨ TRUE KNOWING achieved!'}
      </div>
    </motion.div>
  );
}

