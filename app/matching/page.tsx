/**
 * Matching Page - View Mentor-Idea Matches
 * 
 * Production-ready page for viewing and managing matches
 * - Users can see matches for their ideas
 * - Mentors can see their matched ideas
 * - Public view of matching system
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Lightbulb, 
  TrendingUp, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter,
  ExternalLink,
  Mail,
  Phone,
  Building2,
  Award,
  Target
} from 'lucide-react';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import { getUserFriendlyError, logError } from '@/lib/utils/error-handler';

interface Idea {
  id: string;
  title: string;
  problem_statement: string;
  proposed_solution: string | null;
  category: string | null;
  location: string | null;
  status: string;
  ai_feasibility_score: number | null;
  ai_impact_score: number | null;
  roi_time_saved_hours: number | null;
  roi_cost_saved_eur: number | null;
  alignment: any;
  created_at: string;
}

interface Mentor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  moroccan_city: string | null;
  expertise: string[] | null;
  skills: string[] | null;
  years_experience: number | null;
  company: string | null;
  currentrole: string[] | null;
  willing_to_mentor: boolean | null;
  willing_to_cofund: boolean | null;
  ideas_matched: number | null;
  ideas_funded: number | null;
}

interface MentorMatch {
  id: string;
  match_score: number | null;
  match_reason: string | null;
  status: string;
  matched_by: string | null;
  created_at: string;
  mentor_responded_at: string | null;
  idea: Idea;
  mentor: Mentor;
}

type ViewMode = 'user' | 'mentor' | 'public';
type StatusFilter = 'all' | 'pending' | 'active' | 'accepted' | 'rejected';

export default function MatchingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, success, error: showError, removeToast } = useToast();
  
  const [viewMode, setViewMode] = useState<ViewMode>('public');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [matches, setMatches] = useState<MentorMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // User identification
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [mentorEmail, setMentorEmail] = useState('');
  const [mentorPhone, setMentorPhone] = useState('');
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check URL params for view mode
    const mode = searchParams.get('mode') as ViewMode;
    if (mode && ['user', 'mentor', 'public'].includes(mode)) {
      setViewMode(mode);
    }
    
    const email = searchParams.get('email') || '';
    const phone = searchParams.get('phone') || '';
    
    if (mode === 'mentor') {
      setMentorEmail(email);
      setMentorPhone(phone);
    } else if (mode === 'user') {
      setUserEmail(email);
      setUserPhone(phone);
    }
  }, [searchParams]);

  useEffect(() => {
    if (viewMode === 'mentor' && (mentorEmail || mentorPhone)) {
      fetchMentorMatches();
    } else if (viewMode === 'user' && (userEmail || userPhone)) {
      fetchUserMatches();
    } else if (viewMode === 'public') {
      fetchPublicMatches();
    }
  }, [viewMode, statusFilter, mentorEmail, mentorPhone, userEmail, userPhone]);

  const fetchMentorMatches = async () => {
    if (!mentorEmail && !mentorPhone) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (mentorEmail) params.set('email', mentorEmail);
      if (mentorPhone) params.set('phone', mentorPhone);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`/api/mentor/matches?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch matches');
      }
      
      setMatches(data.matches || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load matches';
      setError(errorMessage);
      logError(err, 'MatchingPage');
      showError(getUserFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMatches = async () => {
    // TODO: Implement API endpoint for user idea matches
    setLoading(true);
    setError(null);
    
    try {
      // For now, show message that this feature is coming
      setError('Feature coming soon: View matches for your ideas');
      setMatches([]);
    } catch (err: any) {
      logError(err, 'MatchingPage');
      showError(getUserFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicMatches = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch public matches (accepted matches for visible ideas)
      const params = new URLSearchParams();
      params.set('status', 'accepted');
      params.set('public', 'true');

      const response = await fetch(`/api/admin/mentor-matches?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch matches');
      }
      
      // Flatten grouped matches
      const flattened: MentorMatch[] = [];
      if (Array.isArray(data.matches)) {
        data.matches.forEach((group: any) => {
          if (group.matches && Array.isArray(group.matches)) {
            flattened.push(...group.matches);
          }
        });
      }
      
      setMatches(flattened);
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching public matches:', err);
      }
      setError('Failed to load public matches');
      logError(err, 'MatchingPage');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMatch = async (matchId: string) => {
    if (!mentorEmail && !mentorPhone) {
      showError('Please enter your email or phone to accept matches');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir accepter ce match ? Vous serez notifié lorsque le porteur d\'idée sera prêt à vous contacter.')) {
      return;
    }

    try {
      const response = await fetch('/api/mentor/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept',
          match_id: matchId,
          mentor_email: mentorEmail || undefined,
          mentor_phone: mentorPhone || undefined,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        success('✅ Match accepté ! Vous serez contacté prochainement.');
        fetchMentorMatches(); // Refresh
      } else {
        showError(data.error || 'Erreur lors de l\'acceptation');
      }
    } catch (err: any) {
      logError(err, 'MatchingPage');
      showError(getUserFriendlyError(err));
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    if (!mentorEmail && !mentorPhone) {
      showError('Please enter your email or phone to reject matches');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir rejeter ce match ?')) {
      return;
    }

    try {
      const response = await fetch('/api/mentor/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          match_id: matchId,
          mentor_email: mentorEmail || undefined,
          mentor_phone: mentorPhone || undefined,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        success('Match rejeté');
        fetchMentorMatches(); // Refresh
      } else {
        showError(data.error || 'Erreur lors du rejet');
      }
    } catch (err: any) {
      logError(err, 'MatchingPage');
      showError(getUserFriendlyError(err));
    }
  };

  const filteredMatches = matches.filter(match => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        match.idea.title.toLowerCase().includes(query) ||
        match.idea.problem_statement.toLowerCase().includes(query) ||
        match.mentor.name.toLowerCase().includes(query) ||
        (match.mentor.company && match.mentor.company.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      active: { label: 'Actif', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      accepted: { label: 'Accepté', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    
    const statusInfo = statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-800', icon: Clock };
    const Icon = statusInfo.icon;
    
    return (
      <Badge className={statusInfo.color}>
        <Icon className="w-3 h-3 mr-1" />
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              🤝 Matching Mentor-Idée
            </h1>
            <p className="text-lg text-slate-600">
              Connectez les entrepreneurs avec les mentors de la diaspora
            </p>
          </div>

          {/* View Mode Selector */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'public' ? 'primary' : 'outline'}
                    onClick={() => setViewMode('public')}
                    size="sm"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Vue Publique
                  </Button>
                  <Button
                    variant={viewMode === 'mentor' ? 'primary' : 'outline'}
                    onClick={() => setViewMode('mentor')}
                    size="sm"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Mes Matches (Mentor)
                  </Button>
                  <Button
                    variant={viewMode === 'user' ? 'primary' : 'outline'}
                    onClick={() => setViewMode('user')}
                    size="sm"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Mes Idées (Entrepreneur)
                  </Button>
                </div>
                
                {/* Status Filter */}
                <div className="flex gap-2 items-center">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="px-3 py-1 border border-slate-300 rounded-md text-sm"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="active">Actif</option>
                    <option value="accepted">Accepté</option>
                    <option value="rejected">Rejeté</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mentor Login Form */}
          {viewMode === 'mentor' && !mentorEmail && !mentorPhone && (
            <Card className="mb-6 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Identifiez-vous comme Mentor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={mentorEmail}
                      onChange={(e) => setMentorEmail(e.target.value)}
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Téléphone
                    </label>
                    <Input
                      type="tel"
                      value={mentorPhone}
                      onChange={(e) => setMentorPhone(e.target.value)}
                      placeholder="+212 6XX XXX XXX"
                    />
                  </div>
                </div>
                <Button
                  onClick={fetchMentorMatches}
                  className="mt-4 w-full md:w-auto"
                  disabled={!mentorEmail && !mentorPhone}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Voir mes matches
                </Button>
              </CardContent>
            </Card>
          )}

          {/* User Login Form */}
          {viewMode === 'user' && !userEmail && !userPhone && (
            <Card className="mb-6 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Identifiez-vous comme Entrepreneur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Téléphone
                    </label>
                    <Input
                      type="tel"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="+212 6XX XXX XXX"
                    />
                  </div>
                </div>
                <Button
                  onClick={fetchUserMatches}
                  className="mt-4 w-full md:w-auto"
                  disabled={!userEmail && !userPhone}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Voir mes matches
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Search Bar */}
          {matches.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher par titre, problème, mentor..."
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Chargement des matches...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <p className="text-red-800">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !error && filteredMatches.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Aucun match trouvé
                </h3>
                <p className="text-slate-600 mb-6">
                  {viewMode === 'mentor' 
                    ? 'Vous n\'avez pas encore de matches. Les matches apparaîtront ici une fois qu\'un admin les aura approuvés.'
                    : viewMode === 'user'
                    ? 'Vos idées n\'ont pas encore de matches. Les matches apparaîtront ici une fois qu\'ils seront créés.'
                    : 'Aucun match public disponible pour le moment.'}
                </p>
                {viewMode === 'public' && (
                  <Button onClick={() => router.push('/become-mentor')}>
                    Devenir Mentor
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Matches List */}
          {!loading && !error && filteredMatches.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  {filteredMatches.length} match{filteredMatches.length > 1 ? 'es' : ''} trouvé{filteredMatches.length > 1 ? 's' : ''}
                </h2>
              </div>

              {filteredMatches.map((match) => (
                <Card key={match.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Idea Section */}
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="w-5 h-5 text-indigo-600" />
                              <h3 className="text-xl font-bold text-slate-900">
                                {match.idea.title}
                              </h3>
                            </div>
                            {match.idea.category && (
                              <Badge className="mb-2">{match.idea.category}</Badge>
                            )}
                            {match.idea.location && (
                              <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
                                <MapPin className="w-4 h-4" />
                                {match.idea.location}
                              </div>
                            )}
                          </div>
                          {getStatusBadge(match.status)}
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-900 mb-1">Problème:</h4>
                          <p className="text-sm text-slate-700 line-clamp-3">
                            {match.idea.problem_statement}
                          </p>
                        </div>

                        {match.idea.proposed_solution && (
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-1">Solution:</h4>
                            <p className="text-sm text-slate-700 line-clamp-3">
                              {match.idea.proposed_solution}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-4 text-sm">
                          {match.idea.ai_feasibility_score !== null && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              <span className="font-semibold">Faisabilité:</span>
                              <span>{Math.round(match.idea.ai_feasibility_score * 10)}/10</span>
                            </div>
                          )}
                          {match.idea.ai_impact_score !== null && (
                            <div className="flex items-center gap-1">
                              <Award className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold">Impact:</span>
                              <span>{Math.round(match.idea.ai_impact_score * 10)}/10</span>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/idea/${match.idea.id}`)}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Voir l'idée complète
                        </Button>
                      </div>

                      {/* Mentor Section */}
                      <div className="space-y-4 border-l border-slate-200 pl-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-5 h-5 text-green-600" />
                              <h3 className="text-xl font-bold text-slate-900">
                                {match.mentor.name}
                              </h3>
                            </div>
                            {match.mentor.currentrole && match.mentor.currentrole.length > 0 && (
                              <p className="text-sm text-slate-600 mb-1">
                                {Array.isArray(match.mentor.currentrole) 
                                  ? match.mentor.currentrole[0] 
                                  : match.mentor.currentrole}
                              </p>
                            )}
                            {match.mentor.company && (
                              <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
                                <Building2 className="w-4 h-4" />
                                {match.mentor.company}
                              </div>
                            )}
                          </div>
                          {match.match_score !== null && (
                            <Badge className="bg-indigo-100 text-indigo-800">
                              {Math.round(match.match_score * 100)}% match
                            </Badge>
                          )}
                        </div>

                        {match.mentor.expertise && match.mentor.expertise.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-1 text-sm">Expertise:</h4>
                            <div className="flex flex-wrap gap-1">
                              {match.mentor.expertise.slice(0, 5).map((exp, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {exp}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {match.mentor.skills && match.mentor.skills.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-1 text-sm">Compétences:</h4>
                            <div className="flex flex-wrap gap-1">
                              {match.mentor.skills.slice(0, 5).map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-slate-50">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {match.match_reason && (
                          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                            <h4 className="font-semibold text-indigo-900 mb-1 text-sm">Pourquoi ce match?</h4>
                            <p className="text-xs text-indigo-800">{match.match_reason}</p>
                          </div>
                        )}

                        {/* Action Buttons (for mentors) */}
                        {viewMode === 'mentor' && match.status === 'active' && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => handleAcceptMatch(match.id)}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Accepter
                            </Button>
                            <Button
                              onClick={() => handleRejectMatch(match.id)}
                              variant="outline"
                              className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Rejeter
                            </Button>
                          </div>
                        )}

                        {viewMode === 'mentor' && match.status === 'accepted' && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-800">
                              ✅ Match accepté le {new Date(match.mentor_responded_at || match.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}


