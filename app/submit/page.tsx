/**
 * Redirect to Simple Voice Submit (WhatsApp-native)
 * 
 * Old complex form replaced with mic-first simple UI
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitIdeaPage() {
  const router = useRouter();
  
  // Redirect to simple voice submit (WhatsApp-native)
  useEffect(() => {
    router.replace('/submit-voice');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirection vers la soumission vocale...</p>
    </div>
  );
}
