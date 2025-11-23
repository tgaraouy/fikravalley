/**
 * FIND MENTOR - Voice-Driven AI Mentor Matching
 * 
 * User describes background and motivation via voice
 * AI agent analyzes and recommends mentors from database
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, CheckCircle, Star, Mic } from 'lucide-react';
import VoiceMentorSearch from '@/components/mentor/VoiceMentorSearch';

interface MentorMatch {
  mentor: {
    id: string;
    name: string;
    avatar: string;
    title: string;
    company: string;
    expertise: string[];
    sectors: string[];
    locations: string[];
    livedExperience: {
      founded: string[];
      worked: string[];
      yearsExperience: number;
    };
    availableSlots: number;
    responseRate: number;
    avgResponseTime: string;
    successRate: number;
    intimacyRating: number;
  };
  matchScore: number;
  reasons: string[];
  confidence: 'low' | 'medium' | 'high' | 'perfect';
}

export default function FindMentorPage() {
  const router = useRouter();
  const [background, setBackground] = useState('');
  const [motivation, setMotivation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState<MentorMatch[]>([]);
  const [requestingIntro, setRequestingIntro] = useState<string | null>(null);

  const handleFindMentors = async (userBackground: string, userMotivation: string) => {
    setBackground(userBackground);
    setMotivation(userMotivation);
    
    setIsSearching(true);
    setMatches([]);

    try {
      // Send background and motivation to AI agent
      const response = await fetch('/api/agents/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'find_matches_by_profile',
          data: {
            background: userBackground,
            motivation: userMotivation,
            // AI will extract: sector, skills, location, needs from voice input
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setMatches(result.data || []);
        if (result.data.length === 0) {
          alert('Aucun mentor trouvé. L\'IA cherche des mentors qui correspondent à ton profil...');
        }
      } else {
        alert(`Erreur: ${result.error || 'Impossible de trouver des mentors'}`);
      }
    } catch (error) {
      console.error('Error finding mentors:', error);
      alert('Erreur lors de la recherche de mentors');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRequestIntroduction = async (mentorId: string) => {
    setRequestingIntro(mentorId);

    try {
      // Generate introduction message
      const response = await fetch('/api/agents/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_introduction',
          data: {
            mentor: matches.find(m => m.mentor.id === mentorId)?.mentor,
            creator: { 
              name: 'Vous', 
              email: '',
              background: background,
              motivation: motivation
            },
            idea: {
              problem: { 
                description: `${background}. ${motivation}`, 
                sector: 'auto-detected',
                location: 'auto-detected'
              }
            }
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        // Copy introduction to clipboard
        const introText = `${result.data.subject}\n\n${result.data.body}`;
        navigator.clipboard.writeText(introText);
        alert('✅ Message d\'introduction copié! Collez-le dans votre email/WhatsApp.');
      } else {
        alert('Erreur lors de la génération du message');
      }
    } catch (error) {
      console.error('Error generating introduction:', error);
      alert('Erreur lors de la génération du message');
    } finally {
      setRequestingIntro(null);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'perfect': return 'bg-green-100 text-green-800 border-green-300';
      case 'high': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'perfect': return 'Match Parfait';
      case 'high': return 'Très Bon Match';
      case 'medium': return 'Bon Match';
      default: return 'Match Potentiel';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            🤝 Trouvez votre Mentor
          </h1>
          <p className="text-lg text-slate-600">
            Parle de ton parcours et ta motivation. L'IA trouve les meilleurs mentors pour toi.
          </p>
        </div>

        {/* Voice-Driven Search */}
        <Card className="mb-8 border-2 border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-600" />
              Décris-toi (par voix ou texte)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VoiceMentorSearch 
              onFindMentors={handleFindMentors}
              isSearching={isSearching}
            />
          </CardContent>
        </Card>

        {/* Results */}
        {matches.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {matches.length} Mentor{matches.length > 1 ? 's' : ''} Trouvé{matches.length > 1 ? 's' : ''}
            </h2>

            {matches.map((match) => (
              <Card key={match.mentor.id} className="border-2 border-slate-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Mentor Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                          {match.mentor.name[0]}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 mb-1">
                            {match.mentor.name}
                          </h3>
                          <p className="text-slate-600 mb-1">
                            {match.mentor.title} @ {match.mentor.company}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap mt-2">
                            <Badge className={getConfidenceColor(match.confidence)}>
                              {getConfidenceLabel(match.confidence)}
                            </Badge>
                            <Badge className="bg-purple-100 text-purple-800">
                              {match.matchScore}/100
                            </Badge>
                            {match.mentor.intimacyRating >= 8 && (
                              <Badge className="bg-orange-100 text-orange-800">
                                ⭐ Expert ({match.mentor.intimacyRating}/10)
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Expérience:</p>
                        <ul className="text-sm text-slate-600 space-y-1">
                          <li>• {match.mentor.livedExperience.yearsExperience} ans d'expérience</li>
                          {match.mentor.livedExperience.founded.length > 0 && (
                            <li>• Fondé: {match.mentor.livedExperience.founded.join(', ')}</li>
                          )}
                          {match.mentor.livedExperience.worked.length > 0 && (
                            <li>• A travaillé: {match.mentor.livedExperience.worked.join(', ')}</li>
                          )}
                        </ul>
                      </div>

                      {/* Expertise */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Expertise:</p>
                        <div className="flex flex-wrap gap-2">
                          {match.mentor.expertise.slice(0, 5).map((exp, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {exp}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Match Reasons */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Pourquoi ce match:</p>
                        <ul className="text-sm text-slate-600 space-y-1">
                          {match.reasons.slice(0, 3).map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Taux de réussite</p>
                          <p className="font-bold text-slate-900">
                            {Math.round(match.mentor.successRate * 100)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Réponse</p>
                          <p className="font-bold text-slate-900">
                            {match.mentor.avgResponseTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Disponibilité</p>
                          <p className="font-bold text-slate-900">
                            {match.mentor.availableSlots} slot{match.mentor.availableSlots > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action */}
                    <div className="md:w-48 flex flex-col gap-3">
                      <Button
                        onClick={() => handleRequestIntroduction(match.mentor.id)}
                        disabled={requestingIntro === match.mentor.id}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                      >
                        {requestingIntro === match.mentor.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Génération...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Demander Introduction
                          </>
                        )}
                      </Button>

                      {match.mentor.availableSlots === 0 && (
                        <p className="text-xs text-red-600 text-center">
                          Complet ce mois
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isSearching && matches.length === 0 && (background || motivation) && (
          <Card className="border-2 border-slate-200">
            <CardContent className="p-8 text-center">
              <p className="text-slate-600">
                Aucun mentor trouvé. L'IA cherche des mentors qui correspondent à ton profil...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-blue-900 mb-2">💡 Comment ça marche?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. 🎤 Parle de ton parcours (expérience, compétences, secteur)</li>
              <li>2. 🎯 Décris ta motivation (pourquoi tu cherches un mentor)</li>
              <li>3. 🤖 L'IA analyse et trouve les mentors les plus pertinents</li>
              <li>4. 💬 Clique "Demander Introduction" → Message généré</li>
              <li>5. 📧 Copie le message et envoie-le au mentor (email/WhatsApp)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Mentor Registration CTA */}
        <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <h3 className="font-bold text-green-900 mb-2">👨‍🏫 Vous êtes mentor?</h3>
            <p className="text-sm text-green-800 mb-4">
              Rejoignez notre programme de mentorat et aidez les entrepreneurs marocains
            </p>
            <Button
              onClick={() => router.push('/become-mentor')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              S'inscrire comme Mentor
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

