/**
 * Fikra Journal - Voice-First Input with Offline Storage
 * 
 * Auto-saves every 30 seconds to IndexedDB
 * Voice notes stored as blobs
 */

export interface JournalEntry {
  id: string;
  fikraTag: string;
  timestamp: Date;
  type: 'text' | 'voice';
  content: string | Blob; // String for text, Blob for voice
  synced: boolean;
  step?: string; // Which micro-step this belongs to
}

const DB_NAME = 'FikraJournal';
const DB_VERSION = 1;
const STORE_NAME = 'entries';

/**
 * Initialize IndexedDB
 */
export async function initJournalDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('fikraTag', 'fikraTag', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('synced', 'synced', { unique: false });
      }
    };
  });
}

/**
 * Auto-save entry to IndexedDB (offline-first)
 */
export async function autoSaveEntry(
  userId: string,
  fikraTag: string,
  input: string | Blob,
  step?: string
): Promise<void> {
  const db = await initJournalDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  const entry: JournalEntry = {
    id: `${fikraTag}-${Date.now()}`,
    fikraTag,
    timestamp: new Date(),
    type: typeof input === 'string' ? 'text' : 'voice',
    content: input,
    synced: false,
    step
  };
  
  await new Promise<void>((resolve, reject) => {
    const request = store.put(entry);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  
  db.close();
}

/**
 * Get all entries for a FikraTag
 */
export async function getEntriesForTag(fikraTag: string): Promise<JournalEntry[]> {
  const db = await initJournalDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index('fikraTag');
  
  return new Promise((resolve, reject) => {
    const request = index.getAll(fikraTag);
    request.onsuccess = () => {
      const entries = request.result.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
      resolve(entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get unsynced entries
 */
export async function getUnsyncedEntries(): Promise<JournalEntry[]> {
  const db = await initJournalDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index('synced');
  
  return new Promise((resolve, reject) => {
    const request = index.openCursor(IDBKeyRange.only(false)); // Get all unsynced
    const entries: JournalEntry[] = [];
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        entries.push({
          ...cursor.value,
          timestamp: new Date(cursor.value.timestamp)
        });
        cursor.continue();
      } else {
        resolve(entries);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Mark entries as synced
 */
export async function markEntriesAsSynced(entryIds: string[]): Promise<void> {
  const db = await initJournalDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  for (const id of entryIds) {
    const getRequest = store.get(id);
    await new Promise<void>((resolve) => {
      getRequest.onsuccess = () => {
        const entry = getRequest.result;
        if (entry) {
          entry.synced = true;
          store.put(entry);
        }
        resolve();
      };
    });
  }
  
  db.close();
}

