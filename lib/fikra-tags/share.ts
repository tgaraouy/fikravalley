/**
 * WhatsApp-Native Sharing
 * 
 * ONE TAP generates WhatsApp message with FikraTag
 * Uses optimized viral loop format
 */

import { shareFikraTagViaWhatsApp } from '@/lib/share/whatsapp-share';

export function shareFikraTag(tag: string, ideaTitle?: string): void {
  shareFikraTagViaWhatsApp(tag, ideaTitle);
}

/**
 * Share via SMS (fallback)
 */
export function shareViaSMS(tag: string, phone?: string): void {
  const message = `FikraTag: ${tag}\nTrack: fikravalley.com/track/${tag}`;
  
  if (phone) {
    window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
  } else {
    // Copy to clipboard
    navigator.clipboard.writeText(message).then(() => {
      alert('Code copié! Collez-le dans votre SMS.');
    });
  }
}

