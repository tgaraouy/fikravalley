/**
 * Example: Show only user's ideas
 * 
 * This shows how to filter ideas by the current user
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase-client';
import { useEffect, useState } from 'react';

export default function MyIdeasPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchMyIdeas() {
      if (!user) return;
      const supabase = createClient();

      // Filter by user_id (you need to add this column to marrai_ideas)
      const { data, error } = await supabase
        .from('marrai_ideas')
        .select('*')
        .eq('user_id', user.id) // Only get current user's ideas
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ideas:', error);
      } else {
        setIdeas(data || []);
      }
      setIsLoading(false);
    }

    fetchMyIdeas();
  }, [user]);

  if (authLoading || isLoading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <div>Veuillez vous connecter pour voir vos idées</div>;
  }

  return (
    <div>
      <h1>Mes Idées ({ideas.length})</h1>
      {/* Render ideas */}
    </div>
  );
}

