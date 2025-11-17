'use client';

/**
 * AI Agent Chat Component
 * 
 * Interactive AI assistant that helps users during idea submission.
 * Provides real-time suggestions, answers questions, and guides users.
 */

import { useState, useRef, useEffect, useId } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Bot, Sparkles, X, Minimize2, Maximize2, Mic, MicOff } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actionItems?: string[];
}

interface AIAgentChatProps {
  context?: {
    step?: number;
    stepName?: string;
    currentData?: Record<string, any>;
    language?: 'fr' | 'darija';
  };
  onSuggestionApply?: (suggestion: string) => void;
  minimized?: boolean;
  onMinimize?: () => void;
  onToggle?: (isMinimized: boolean) => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right';
}

export default function AIAgentChat({
  context,
  onSuggestionApply,
  minimized: initialMinimized = false,
  onMinimize,
  onToggle,
  position = 'bottom-right',
}: AIAgentChatProps) {
  const baseId = useId();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [minimized, setMinimized] = useState(initialMinimized);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [micNotFound, setMicNotFound] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize messages and speech recognition on client side only
  useEffect(() => {
    setIsMounted(true);
    setMessages([
      {
        id: `${baseId}-init`,
        role: 'assistant',
        content: context?.language === 'darija' 
          ? 'Salam! Ana l-assistant dyal l-IA. Kifash n3awnk f soubmission dyal l-idea?'
          : 'Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider avec votre soumission d\'idée ?',
        timestamp: new Date(),
      },
    ]);

    // Initialize Speech Recognition if available
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true; // Show interim results for better UX
        recognitionInstance.lang = context?.language === 'darija' || context?.language === 'ar' 
          ? 'ar-MA' 
          : 'fr-FR';

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          // Update input with both final and interim results
          if (finalTranscript) {
            setInput(prev => prev ? `${prev} ${finalTranscript.trim()}` : finalTranscript.trim());
          } else if (interimTranscript) {
            // Show interim results in real-time
            setInput(prev => {
              const baseText = prev.split(' [en cours...]')[0]; // Remove previous interim
              return baseText ? `${baseText} ${interimTranscript} [en cours...]` : `${interimTranscript} [en cours...]`;
            });
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          setInput(prev => prev.replace(' [en cours...]', ''));
          
          if (event.error === 'no-speech') {
            // User didn't speak, just stop silently
            return;
          } else if (event.error === 'not-allowed' || event.error === 'denied') {
            setMicPermissionDenied(true);
            // Don't show alert immediately, show UI message instead
          } else if (event.error === 'aborted') {
            // User or system aborted, normal behavior
            return;
          } else {
            // Other errors - log but don't show alert for every error
            console.warn('Speech recognition error:', event.error);
          }
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
          setInput(prev => prev.replace(' [en cours...]', ''));
        };

        recognitionRef.current = recognitionInstance;
        setRecognition(recognitionInstance);
      }
    }
  }, [baseId, context?.language]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !isMounted) return;

    const userMessage: Message = {
      id: `${baseId}-user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: {
            step: context?.step,
            stepName: context?.stepName,
            currentData: context?.currentData,
            language: context?.language || 'fr',
            conversationHistory: messages.slice(-5), // Last 5 messages for context
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: `${baseId}-assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions,
        actionItems: data.actionItems,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `${baseId}-error-${Date.now()}`,
        role: 'assistant',
        content: context?.language === 'darija'
          ? 'Sm7li, kayn chi mochkil. 3awd jrab b3d shwiya.'
          : 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = async () => {
    const rec = recognitionRef.current || recognition;
    
    if (!rec) {
      alert(context?.language === 'darija' 
        ? 'Voice recognition mashi available f had l-browser. 7awl Chrome, Edge, wla Safari.'
        : 'La reconnaissance vocale n\'est pas disponible dans ce navigateur. Utilisez Chrome, Edge ou Safari.');
      return;
    }

    if (isRecording) {
      rec.stop();
      setIsRecording(false);
      setInput(prev => prev.replace(' [en cours...]', ''));
    } else {
      // Check if microphone is available first
      try {
        // First, enumerate devices to check availability
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        
        if (audioInputs.length === 0) {
          setMicNotFound(true);
          setIsRecording(false);
          alert(context?.language === 'darija'
            ? 'Microphone mashi mawjoud f had l-appareil.\n\n7awl:\n1. Rbt microphone external\n2. T7ak 3la settings dyal system\n3. 3awd jrab'
            : 'Aucun microphone trouvé sur cet appareil.\n\nVérifiez:\n1. Connectez un microphone externe\n2. Vérifiez les paramètres système\n3. Réessayez');
          return;
        }

        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Permission granted, stop the stream and start recognition
        stream.getTracks().forEach(track => track.stop());
        setMicPermissionDenied(false);
        setMicNotFound(false);
      } catch (permissionError: any) {
        console.error('Microphone permission error:', permissionError);
        setIsRecording(false);
        
        if (permissionError.name === 'NotFoundError' || permissionError.name === 'DevicesNotFoundError') {
          setMicNotFound(true);
          alert(context?.language === 'darija'
            ? 'Microphone mashi mawjoud.\n\n7awl:\n1. Rbt microphone external\n2. T7ak 3la settings dyal system\n3. 3awd jrab'
            : 'Aucun microphone trouvé.\n\nVérifiez:\n1. Connectez un microphone externe\n2. Vérifiez les paramètres système\n3. Réessayez');
        } else if (permissionError.name === 'NotAllowedError' || permissionError.name === 'PermissionDenied') {
          setMicPermissionDenied(true);
          // Show helpful message
          alert(context?.language === 'darija'
            ? 'Permission dyal microphone mashi m7dala.\n\nKifash t7dlha:\n1. Klik 3la l-icon dyal lock f l-URL bar\n2. Khtar "Allow" f microphone\n3. 3awd jrab'
            : 'Permission du microphone refusée.\n\nPour l\'autoriser:\n1. Cliquez sur l\'icône de cadenas dans la barre d\'adresse\n2. Sélectionnez "Autoriser" pour le microphone\n3. Réessayez');
        } else {
          // Other errors
          console.warn('Unexpected microphone error:', permissionError);
          alert(context?.language === 'darija'
            ? 'Mochkil f microphone. 7awl t3awd.'
            : 'Erreur avec le microphone. Veuillez réessayer.');
        }
        return;
      }

      try {
        // Clear any previous interim text
        setInput(prev => prev.replace(' [en cours...]', ''));
        
        rec.lang = context?.language === 'darija' || context?.language === 'ar' 
          ? 'ar-MA' 
          : 'fr-FR';
        rec.start();
        setIsRecording(true);
        setMicPermissionDenied(false);
      } catch (error: any) {
        console.error('Error starting recognition:', error);
        setIsRecording(false);
        if (error.message?.includes('already started')) {
          // Already recording, just update state
          setIsRecording(true);
        } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDenied') {
          setMicPermissionDenied(true);
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          setMicNotFound(true);
        }
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionApply) {
      onSuggestionApply(suggestion);
    }
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const toggleMinimize = () => {
    const newMinimized = !minimized;
    setMinimized(newMinimized);
    if (onMinimize) {
      onMinimize();
    }
    if (onToggle) {
      onToggle(newMinimized);
    }
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
  };

  // Ensure chat doesn't block form inputs - use lower z-index and pointer-events
  const chatZIndex = minimized ? 'z-40' : 'z-30';

  if (!isMounted) {
    return null; // Don't render until mounted on client
  }

  if (minimized) {
    return (
      <div className={`fixed ${positionClasses[position]} ${chatZIndex} pointer-events-auto transition-all duration-300`}>
        <Button
          onClick={toggleMinimize}
          className="rounded-full w-14 h-14 shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-transform hover:scale-110"
        >
          <Bot className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} ${chatZIndex} w-96 max-w-[calc(100vw-2rem)] pointer-events-auto transition-all duration-300 ease-in-out ${
      minimized ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
    }`}>
      <Card className="shadow-2xl border-indigo-200 bg-white max-h-[80vh] flex flex-col">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bot className="w-5 h-5" />
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
              </div>
              <CardTitle className="text-base font-semibold">
                Assistant IA
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMinimize}
                className="text-white hover:bg-white/20 h-6 w-6 p-0"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              {onMinimize && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMinimize}
                  className="text-white hover:bg-white/20 h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          {context?.stepName && (
            <p className="text-xs text-indigo-100 mt-1">
              Étape: {context.stepName}
            </p>
          )}
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded border border-indigo-200 transition-colors"
                        >
                          💡 {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Action Items */}
                  {message.actionItems && message.actionItems.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-semibold mb-1">Actions suggérées:</p>
                      {message.actionItems.map((item, idx) => (
                        <div key={idx} className="text-xs text-slate-600">
                          • {item}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-lg px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={context?.language === 'darija' 
                  ? 'Kteb wla 7der...'
                  : 'Tapez ou parlez votre question...'}
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isLoading || isRecording}
              />
              <div className="flex flex-col gap-2 self-end">
                <Button
                  type="button"
                  onClick={toggleRecording}
                  disabled={isLoading || !recognition}
                  className={`h-10 w-10 p-0 ${
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                      : 'bg-slate-600 hover:bg-slate-700'
                  } text-white`}
                  title={isRecording 
                    ? (context?.language === 'darija' ? 'Bqal 7der' : 'Arrêter l\'enregistrement')
                    : (context?.language === 'darija' ? 'Bda7 7der' : 'Démarrer l\'enregistrement vocal')
                  }
                >
                  {isRecording ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || isRecording}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 w-10 p-0"
                  title={context?.language === 'darija' ? 'B3ath' : 'Envoyer'}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            {isRecording && (
              <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                <p className="text-xs text-red-700 font-medium">
                  {context?.language === 'darija' 
                    ? 'Kayn 7der... 7der daba'
                    : 'Enregistrement en cours... Parlez maintenant'}
                </p>
              </div>
            )}
            {micPermissionDenied && !isRecording && (
              <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md">
                <div className="w-2 h-2 bg-amber-600 rounded-full" />
                <div className="flex-1">
                  <p className="text-xs text-amber-800 font-medium">
                    {context?.language === 'darija'
                      ? 'Permission dyal microphone mashi m7dala'
                      : 'Permission du microphone refusée'}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    {context?.language === 'darija'
                      ? 'Klik 3la l-icon dyal lock f l-URL bar bach t7dlha'
                      : 'Cliquez sur l\'icône de cadenas dans la barre d\'adresse pour autoriser'}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setMicPermissionDenied(false)}
                  className="h-6 w-6 p-0 text-amber-700 hover:text-amber-900"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            {micNotFound && !isRecording && (
              <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md">
                <div className="w-2 h-2 bg-red-600 rounded-full" />
                <div className="flex-1">
                  <p className="text-xs text-red-800 font-medium">
                    {context?.language === 'darija'
                      ? 'Microphone mashi mawjoud'
                      : 'Aucun microphone trouvé'}
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    {context?.language === 'darija'
                      ? 'Rbt microphone external wla t7ak settings dyal system'
                      : 'Connectez un microphone externe ou vérifiez les paramètres système'}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setMicNotFound(false)}
                  className="h-6 w-6 p-0 text-red-700 hover:text-red-900"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-2">
              💡 {context?.language === 'darija' 
                ? 'L-IA t3awnk b l-w9t l-7y9. T9dr tkteb wla t7der'
                : 'L\'IA peut vous aider à améliorer votre idée en temps réel. Tapez ou parlez'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

