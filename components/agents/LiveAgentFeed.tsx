'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const AGENT_ACTIVITIES = [
    { agent: 'FIKRA', action: 'Analyzing problem statement', location: 'Casablanca' },
    { agent: 'SCORE', action: 'Calculating feasibility', location: 'Tanger' },
    { agent: 'PROOF', action: 'Verifying market data', location: 'Marrakech' },
    { agent: 'MENTOR', action: 'Matching with expert', location: 'Rabat' },
    { agent: 'DOC', action: 'Generating Intilaka PDF', location: 'Agadir' },
    { agent: 'NETWORK', action: 'Finding similar projects', location: 'Fès' },
    { agent: 'COACH', action: 'Sending daily tip', location: 'Oujda' },
];

export default function LiveAgentFeed() {
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => {
        // Simulate live feed
        const interval = setInterval(() => {
            const randomActivity = AGENT_ACTIVITIES[Math.floor(Math.random() * AGENT_ACTIVITIES.length)];
            const newActivity = {
                id: Date.now(),
                ...randomActivity,
                time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            };

            setActivities(prev => [newActivity, ...prev].slice(0, 5));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto bg-slate-900/5 rounded-xl p-4 backdrop-blur-sm border border-white/20">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Live Agent Activity
                    </h3>
                </div>
                <Badge variant="outline" className="bg-white/50 text-slate-600 border-slate-200">
                    7 Agents Online
                </Badge>
            </div>

            <div className="space-y-2 relative h-32 overflow-hidden">
                <AnimatePresence initial={false}>
                    {activities.map((activity) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, y: -20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-3 text-sm bg-white/80 p-2 rounded-lg shadow-sm border border-white/50"
                        >
                            <span className="font-mono text-xs text-slate-400">{activity.time}</span>
                            <Badge variant="secondary" className="text-xs font-bold bg-slate-100 text-slate-700">
                                {activity.agent}
                            </Badge>
                            <span className="text-slate-700 flex-1 truncate">
                                {activity.action}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                📍 {activity.location}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {activities.length === 0 && (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">
                        Connecting to agent network...
                    </div>
                )}
            </div>
        </div>
    );
}
