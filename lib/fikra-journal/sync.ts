/**
 * Offline-First Sync Strategy
 * 
 * Syncs IndexedDB entries to server when online
 * Handles conflicts gracefully
 */

import { getUnsyncedEntries, markEntriesAsSynced } from './storage';
import type { JournalEntry } from './storage';

/**
 * Sync all pending entries to server
 */
export async function syncAllPendingData(): Promise<void> {
  if (!navigator.onLine) {
    console.log('Offline - skipping sync');
    return;
  }
  
  const unsynced = await getUnsyncedEntries();
  if (unsynced.length === 0) {
    console.log('No unsynced entries');
    return;
  }
  
  console.log(`Syncing ${unsynced.length} entries...`);
  
  // Compress voice notes before upload
  const compressed = await compressEntries(unsynced);
  
  try {
    const response = await fetch('/api/fikra-journal/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: compressed })
    });
    
    if (!response.ok) {
      throw new Error('Sync failed');
    }
    
    const result = await response.json();
    
    // Mark as synced
    await markEntriesAsSynced(unsynced.map(e => e.id));
    
    console.log('Sync complete');
  } catch (error) {
    console.error('Sync error:', error);
    throw error;
  }
}

/**
 * Compress voice notes (convert Blob to base64)
 */
async function compressEntries(entries: JournalEntry[]): Promise<any[]> {
  const compressed: any[] = [];
  
  for (const entry of entries) {
    if (entry.type === 'voice' && entry.content instanceof Blob) {
      // Convert Blob to base64
      const base64 = await blobToBase64(entry.content);
      compressed.push({
        ...entry,
        content: base64,
        contentType: entry.content.type
      });
    } else {
      compressed.push(entry);
    }
  }
  
  return compressed;
}

/**
 * Convert Blob to base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remove data:audio/wav;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Handle conflict resolution
 */
export async function handleConflict(
  localEntry: JournalEntry,
  serverEntry: any
): Promise<'local' | 'server' | 'merge'> {
  // Show user diff and let them choose
  // For now, return 'local' (keep local version)
  // In production, show UI dialog
  
  return 'local';
}

/**
 * Register sync event listener
 */
export function registerSyncListener(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      // Listen for sync events
      (registration as any).sync?.register('sync-fikra');
    });
  }
  
  // Trigger sync when connection returns
  window.addEventListener('online', () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(sw => {
        (sw as any).sync?.register('sync-fikra');
      });
    }
    
    // Also sync immediately
    syncAllPendingData().catch(console.error);
  });
}

