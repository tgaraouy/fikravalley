/**
 * WhatsApp-Native Sharing
 * 
 * ONE TAP generates WhatsApp message with FikraTag
 */

export function shareFikraTag(tag: string): void {
  const message = `رقم فكرتي: ${tag}

راه في طور التحقق، بغيتي رأيك؟

(FikraValley.com/track/${tag})`;

  // Opens WhatsApp with pre-filled message
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
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

