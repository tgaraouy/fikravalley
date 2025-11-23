/**
 * Redirect to Simple Pods (Voice-native)
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PodsPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/pods-simple');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirection vers les pods simplifiés...</p>
    </div>
  );
}
