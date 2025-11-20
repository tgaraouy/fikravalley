/**
 * Agent Dashboard Component
 * Real-time display of all 7 AI agents working together
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentStatus {
  name: string;
  icon: string;
  status: 'idle' | 'thinking' | 'complete' | 'error';
  score?: number;
  message?: string;
  data?: any;
}

interface AgentDashboardProps {
  idea: any;
  onAgentUpdate?: (agent: string, data: any) => void;
}

export default function AgentDashboard({ idea, onAgentUpdate }: AgentDashboardProps) {
  const [agents, setAgents] = useState<Record<string, AgentStatus>>({
    fikra: { name: 'FIKRA', icon: '🎯', status: 'idle' },
    score: { name: 'SCORE', icon: '📊', status: 'idle' },
    proof: { name: 'PROOF', icon: '📸', status: 'idle' },
    mentor: { name: 'MENTOR', icon: '🤝', status: 'idle' },
    doc: { name: 'DOC', icon: '📄', status: 'idle' },
    network: { name: 'NETWORK', icon: '🌐', status: 'idle' },
    coach: { name: 'COACH', icon: '🎓', status: 'idle' },
  });

  // Run FIKRA agent analysis
  useEffect(() => {
    if (!idea?.problem?.description) return;

    const analyzeFikra = async () => {
      setAgents(prev => ({
        ...prev,
        fikra: { ...prev.fikra, status: 'thinking' }
      }));

      try {
        const res = await fetch('/api/agents/fikra', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            draft: {
              text: idea.problem.description,
              wordCount: idea.problem.description.split(/\s+/).length,
              lastUpdated: new Date()
            }
          })
        });

        const result = await res.json();
        
        if (result.success) {
          setAgents(prev => ({
            ...prev,
            fikra: {
              ...prev.fikra,
              status: 'complete',
              score: result.data.intimacyScore,
              message: result.data.message?.french,
              data: result.data
            }
          }));
          onAgentUpdate?.('fikra', result.data);
        }
      } catch (error) {
        setAgents(prev => ({
          ...prev,
          fikra: { ...prev.fikra, status: 'error', message: 'Failed to analyze' }
        }));
      }
    };

    const timer = setTimeout(analyzeFikra, 500);
    return () => clearTimeout(timer);
  }, [idea?.problem?.description]);

  // Run SCORE agent analysis
  useEffect(() => {
    if (!idea?.problem?.description) return;

    const calculateScore = async () => {
      setAgents(prev => ({
        ...prev,
        score: { ...prev.score, status: 'thinking' }
      }));

      try {
        const res = await fetch('/api/agents/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idea })
        });

        const result = await res.json();
        
        if (result.success) {
          setAgents(prev => ({
            ...prev,
            score: {
              ...prev.score,
              status: 'complete',
              score: result.data.current.total,
              message: result.data.qualification?.message?.french,
              data: result.data
            }
          }));
          onAgentUpdate?.('score', result.data);
        }
      } catch (error) {
        setAgents(prev => ({
          ...prev,
          score: { ...prev.score, status: 'error', message: 'Failed to calculate' }
        }));
      }
    };

    const timer = setTimeout(calculateScore, 800);
    return () => clearTimeout(timer);
  }, [idea]);

  // Run PROOF agent (if receipts data available)
  useEffect(() => {
    if (!idea?.receipts || idea.receipts.length === 0) return;

    const analyzeProof = async () => {
      setAgents(prev => ({
        ...prev,
        proof: { ...prev.proof, status: 'thinking' }
      }));

      try {
        const res = await fetch('/api/agents/proof', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'provide_coaching',
            data: { currentCount: idea.receipts.length }
          })
        });

        const result = await res.json();
        
        if (result.success) {
          setAgents(prev => ({
            ...prev,
            proof: {
              ...prev.proof,
              status: 'complete',
              score: result.data.score,
              message: result.data.message?.french,
              data: result.data
            }
          }));
          onAgentUpdate?.('proof', result.data);
        }
      } catch (error) {
        setAgents(prev => ({
          ...prev,
          proof: { ...prev.proof, status: 'error', message: 'Failed to analyze' }
        }));
      }
    };

    analyzeProof();
  }, [idea?.receipts?.length]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🤖</span>
          <span>AI Agents Analysis</span>
          <Badge variant="outline" className="ml-auto">
            {Object.values(agents).filter(a => a.status === 'complete').length}/7 Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* FIKRA Agent */}
          <AgentCard agent={agents.fikra} />

          {/* SCORE Agent */}
          <AgentCard agent={agents.score} />

          {/* PROOF Agent */}
          {idea?.receipts?.length > 0 && (
            <AgentCard agent={agents.proof} />
          )}

          {/* Other agents (coming soon badges) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4 border-t">
            {['mentor', 'doc', 'network', 'coach'].map((key) => (
              <div key={key} className="text-center p-2 border rounded-lg opacity-50">
                <div className="text-2xl">{agents[key as keyof typeof agents].icon}</div>
                <div className="text-xs font-semibold mt-1">
                  {agents[key as keyof typeof agents].name}
                </div>
                <Badge variant="secondary" className="mt-1 text-xs">
                  Coming Soon
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Agent Card Component
function AgentCard({ agent }: { agent: AgentStatus }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-4 ${
        agent.status === 'complete'
          ? 'border-green-200 bg-green-50'
          : agent.status === 'thinking'
          ? 'border-blue-200 bg-blue-50 animate-pulse'
          : agent.status === 'error'
          ? 'border-red-200 bg-red-50'
          : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{agent.icon}</span>
          <span className="font-bold">{agent.name}</span>
        </div>
        
        {agent.status === 'thinking' && (
          <Badge variant="secondary" className="animate-pulse">
            Analyzing...
          </Badge>
        )}
        
        {agent.status === 'complete' && agent.score !== undefined && (
          <Badge variant="default" className="bg-green-600">
            {agent.score.toFixed(1)}/10
          </Badge>
        )}
        
        {agent.status === 'error' && (
          <Badge variant="secondary" className="bg-red-100 text-red-700">Error</Badge>
        )}
      </div>

      {agent.message && (
        <p className="text-sm text-gray-700 mt-2">{agent.message}</p>
      )}

      {agent.status === 'complete' && agent.data && (
        <div className="mt-3 space-y-2">
          {agent.data.progress !== undefined && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{agent.data.progress}%</span>
              </div>
              <Progress value={agent.data.progress} className="h-2" />
            </div>
          )}

          {agent.data.nextQuestion && (
            <div className="text-xs text-gray-600 mt-2 p-2 bg-white rounded border">
              <strong>Next Step:</strong> {agent.data.nextQuestion.question?.french}
            </div>
          )}

          {agent.data.gaps && agent.data.gaps.length > 0 && (
            <div className="text-xs mt-2">
              <strong>Gaps Found:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {agent.data.gaps.slice(0, 3).map((gap: any, i: number) => (
                  <li key={i} className="text-gray-600">
                    {gap.field} (+{gap.potentialGain.toFixed(1)} pts)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

