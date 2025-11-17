'use client';

import { useEffect, useState, useRef } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type IdeaRow = Database['public']['Tables']['marrai_ideas']['Row'];

interface RealtimeEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  timestamp: string;
  idea: IdeaRow;
}

export default function TestRealtimePage() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Subscribe to real-time updates
  const subscribeToIdeas = () => {
    try {
      setError(null);
      setConnectionStatus('connecting');

      // Create a unique channel name for this subscription
      const channelName = `marrai_ideas_test_${Date.now()}`;
      
      // Create channel and subscribe to INSERT, UPDATE, DELETE events
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'marrai_ideas',
          },
          (payload) => {
            console.log('📥 Real-time event received:', payload);

            const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
            const idea = payload.new as IdeaRow || payload.old as IdeaRow;

            if (idea) {
              const newEvent: RealtimeEvent = {
                type: eventType,
                timestamp: new Date().toISOString(),
                idea: idea as IdeaRow,
              };

              setEvents((prev) => [newEvent, ...prev].slice(0, 50)); // Keep last 50 events

              // Log to console
              console.log(`✅ ${eventType} event:`, {
                id: idea.id,
                title: idea.title,
                status: idea.status,
                category: idea.category,
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Subscription status:', status);
          setConnectionStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
          
          if (status === 'SUBSCRIBED') {
            setIsSubscribed(true);
            setError(null);
          } else if (status === 'CHANNEL_ERROR') {
            setError('Channel error occurred');
            setIsSubscribed(false);
          } else if (status === 'TIMED_OUT') {
            setError('Subscription timed out');
            setIsSubscribed(false);
          } else if (status === 'CLOSED') {
            setError('Channel closed');
            setIsSubscribed(false);
          }
        });

      channelRef.current = channel;

      // Handle connection errors
      channel.on('error', (err) => {
        console.error('❌ Channel error:', err);
        setError(`Channel error: ${err.message || 'Unknown error'}`);
        setConnectionStatus('disconnected');
        setIsSubscribed(false);
      });
    } catch (err) {
      console.error('❌ Error setting up subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to set up subscription');
      setConnectionStatus('disconnected');
      setIsSubscribed(false);
    }
  };

  // Unsubscribe from real-time updates
  const unsubscribe = () => {
    try {
      if (channelRef.current) {
        console.log('🔌 Unsubscribing from real-time updates...');
        
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        
        setIsSubscribed(false);
        setConnectionStatus('disconnected');
        setError(null);
        
        console.log('✅ Successfully unsubscribed');
      }
    } catch (err) {
      console.error('❌ Error unsubscribing:', err);
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        console.log('🧹 Cleaning up subscription on unmount...');
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'disconnected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Get event type badge color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'INSERT':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'DELETE':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <Card className="border-white/80 bg-white/95">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Real-time Subscription Test</CardTitle>
          <CardDescription>
            Test Supabase real-time subscriptions on marrai_ideas table
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button
              onClick={isSubscribed ? unsubscribe : subscribeToIdeas}
              variant={isSubscribed ? 'secondary' : 'primary'}
              size="lg"
            >
              {isSubscribed ? '🔌 Unsubscribe' : '📡 Subscribe'}
            </Button>
            <Badge variant="outline" className={getStatusColor(connectionStatus)}>
              {connectionStatus === 'connected' && '✅ Connected'}
              {connectionStatus === 'connecting' && '⏳ Connecting...'}
              {connectionStatus === 'disconnected' && '❌ Disconnected'}
            </Badge>
            {events.length > 0 && (
              <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                {events.length} event{events.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {error && (
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                Error: {error}
              </Badge>
            )}
          </div>

          {/* Instructions */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <h3 className="mb-2 font-semibold text-blue-900">How to test:</h3>
              <ol className="ml-4 list-decimal space-y-1 text-sm text-blue-800">
                <li>Click "Subscribe" to start listening for changes</li>
                <li>Open another tab and submit a new idea at <code className="rounded bg-blue-100 px-1">/submit</code></li>
                <li>Or use the seed endpoint: <code className="rounded bg-blue-100 px-1">POST /api/seed-ideas</code></li>
                <li>Watch events appear in real-time below</li>
                <li>Click "Unsubscribe" to stop listening</li>
              </ol>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg text-red-900">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-800">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Events List */}
          {events.length > 0 ? (
            <Card className="border-slate-200 bg-slate-50">
              <CardHeader>
                <CardTitle className="text-lg">Real-time Events ({events.length})</CardTitle>
                <CardDescription>
                  Events are logged here as they occur. Most recent first.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {events.map((event, index) => (
                    <Card key={`${event.timestamp}-${index}`} className="border-slate-200 bg-white">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getEventTypeColor(event.type)}>
                              {event.type}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {new Date(event.timestamp).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="font-semibold">ID:</span>{' '}
                            <code className="rounded bg-slate-100 px-1 text-xs">{event.idea.id}</code>
                          </div>
                          <div>
                            <span className="font-semibold">Title:</span> {event.idea.title}
                          </div>
                          {event.idea.category && (
                            <div>
                              <span className="font-semibold">Category:</span> {event.idea.category}
                            </div>
                          )}
                          {event.idea.status && (
                            <div>
                              <span className="font-semibold">Status:</span> {event.idea.status}
                            </div>
                          )}
                          {event.idea.location && (
                            <div>
                              <span className="font-semibold">Location:</span> {event.idea.location}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 bg-slate-50">
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">
                  {isSubscribed
                    ? 'Waiting for events... Try submitting a new idea or seeding the database.'
                    : 'Click "Subscribe" to start listening for real-time events.'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Code Example */}
          <Card className="border-indigo-200 bg-indigo-50">
            <CardHeader>
              <CardTitle className="text-lg">Code Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-lg bg-indigo-900 p-4 text-xs text-indigo-100">
                <code>{`// 1. Create channel
const channel = supabase
  .channel('unique-channel-name')
  .on('postgres_changes', {
    event: '*', // or 'INSERT', 'UPDATE', 'DELETE'
    schema: 'public',
    table: 'marrai_ideas',
  }, (payload) => {
    console.log('Event:', payload);
  })
  .subscribe();

// 2. Store channel reference
const channelRef = useRef(channel);

// 3. Cleanup on unmount
useEffect(() => {
  return () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
  };
}, []);`}</code>
              </pre>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

