export interface VoiceDraft {
    id: string;
    transcript: string;
    audioBlob: Blob | null;
    timestamp: number;
    language: 'fr-MA' | 'ar-MA';
    stepId?: string;
}

const DB_NAME = 'FikraVoiceDB';
const STORE_NAME = 'voice_drafts';
const DB_VERSION = 1;

/**
 * Open the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

/**
 * Save a voice draft to IndexedDB
 */
export async function saveVoiceDraft(draft: VoiceDraft): Promise<void> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(draft);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    } catch (error) {
        console.error('[Offline] Failed to save draft:', error);
    }
}

/**
 * Load a voice draft from IndexedDB
 */
export async function loadVoiceDraft(id: string): Promise<VoiceDraft | undefined> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    } catch (error) {
        console.error('[Offline] Failed to load draft:', error);
        return undefined;
    }
}

/**
 * Delete a voice draft
 */
export async function deleteVoiceDraft(id: string): Promise<void> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    } catch (error) {
        console.error('[Offline] Failed to delete draft:', error);
    }
}

/**
 * Check if a draft exists
 */
export async function hasVoiceDraft(id: string): Promise<boolean> {
    const draft = await loadVoiceDraft(id);
    return !!draft;
}

/**
 * Get all voice drafts
 */
export async function getAllVoiceDrafts(): Promise<VoiceDraft[]> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    } catch (error) {
        console.error('[Offline] Failed to load all drafts:', error);
        return [];
    }
}
