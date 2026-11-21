/**
 * Local IndexedDB Storage for Candidate Speaking Audio Recordings & Session History.
 * Allows learners to replay past spoken turns and track Band/WPM improvement over time
 * with zero external backend dependencies.
 */

export interface SavedSpeakingAttempt {
  id: string;
  timestamp: number;
  mode: 'roadmap' | 'cambridge' | 'random';
  topic: string;
  question: string;
  transcript: string;
  overallBand: number;
  wpm: number;
  durationSec: number;
  wordCount: number;
  audioBlob?: Blob | null;
}

const DB_NAME = 'ielts_speaking_studio_db_v1';
const STORE_NAME = 'speaking_attempts';
const DB_VERSION = 1;
const MAX_SAVED_ATTEMPTS = 30;

function openSpeakingDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open Speaking DB'));
  });
}

export async function saveSpeakingAttempt(attempt: SavedSpeakingAttempt): Promise<void> {
  try {
    const db = await openSpeakingDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(attempt);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // Enforce storage cap (keep latest MAX_SAVED_ATTEMPTS)
    const all = await listSpeakingAttempts();
    if (all.length > MAX_SAVED_ATTEMPTS) {
      const toDelete = all.slice(MAX_SAVED_ATTEMPTS);
      for (const old of toDelete) {
        await deleteSpeakingAttempt(old.id);
      }
    }
    db.close();
  } catch (err) {
    console.warn('Could not persist speaking attempt to IndexedDB:', err);
  }
}

export async function listSpeakingAttempts(): Promise<SavedSpeakingAttempt[]> {
  try {
    const db = await openSpeakingDB();
    const results = await new Promise<SavedSpeakingAttempt[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as SavedSpeakingAttempt[]) || []);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return results.sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.warn('Could not read speaking attempts from IndexedDB:', err);
    return [];
  }
}

export async function deleteSpeakingAttempt(id: string): Promise<void> {
  try {
    const db = await openSpeakingDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (err) {
    console.warn('Could not delete speaking attempt:', err);
  }
}

export async function clearAllSpeakingAttempts(): Promise<void> {
  try {
    const db = await openSpeakingDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (err) {
    console.warn('Could not clear speaking history:', err);
  }
}
