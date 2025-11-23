/**
 * Simple Pods Page
 * Voice-native pod creation
 */

'use client';

import { useState } from 'react';
import SimplePods from '@/components/workflow/SimplePods';

export default function SimplePodsPage() {
  const [userId] = useState(`user_${Date.now()}`);
  const [userCity] = useState('casablanca'); // Auto-detect from GPS in production

  return (
    <SimplePods userId={userId} userCity={userCity} />
  );
}

