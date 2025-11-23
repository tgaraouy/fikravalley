/**
 * Redirect to Simple University (WhatsApp-forwarding)
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UniversityPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/university-simple');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirection vers les modules simplifiés...</p>
    </div>
  );
}
