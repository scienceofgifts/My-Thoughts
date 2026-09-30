import { Thought, AppSettings } from '../types/thought';
import { SEED_THOUGHTS, DEFAULT_TOPICS } from '../data/seedThoughts';

const DB_NAME = 'thought_workspace_db';
const DB_VERSION = 1;
const STORE_NAME = 'thoughts';
const SETTINGS_KEY = 'thought_workspace_settings';
const TOPICS_KEY = 'thought_workspace_topics';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('topic', 'topic', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function initDatabase(): Promise<Thought[]> {
  try {
    const db = await openDB();
    const thoughts = await getAllThoughtsFromDB(db);

    if (thoughts.length === 0) {
      // Seed with rich default thoughts
      await seedDatabase(db, SEED_THOUGHTS);
      return SEED_THOUGHTS;
    }
    return thoughts;
  } catch (error) {
    console.error('IndexedDB initialization failed, falling back to in-memory/localStorage', error);
    const fallback = localStorage.getItem('thought_workspace_fallback');
    if (fallback) {
      try {
        return JSON.parse(fallback);
      } catch {
        // ignore
      }
    }
    return SEED_THOUGHTS;
  }
}

function getAllThoughtsFromDB(db: IDBDatabase): Promise<Thought[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function seedDatabase(db: IDBDatabase, seed: Thought[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    seed.forEach((item) => store.put(item));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getAllThoughts(): Promise<Thought[]> {
  try {
    const db = await openDB();
    const thoughts = await getAllThoughtsFromDB(db);
    // Sort by pinned first, then by updatedAt descending
    return thoughts.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  } catch (error) {
    console.error('Error fetching thoughts from IndexedDB', error);
    return SEED_THOUGHTS;
  }
}

export async function getThoughtById(id: string): Promise<Thought | undefined> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error fetching thought by ID', error);
    return undefined;
  }
}

export async function saveThought(thought: Thought): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(thought);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving thought', error);
  }
}

export async function deleteThought(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error deleting thought', error);
  }
}

export async function resetToSeedData(): Promise<Thought[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
    SEED_THOUGHTS.forEach((item) => store.put(item));

    transaction.oncomplete = () => {
      resolve(SEED_THOUGHTS);
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function exportDataAsJson(): Promise<string> {
  const thoughts = await getAllThoughts();
  const topics = getCustomTopics();
  const settings = getStoredSettings();

  const exportPayload = {
    app: 'Thought Workspace',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    thoughts,
    topics,
    settings,
  };

  return JSON.stringify(exportPayload, null, 2);
}

export async function importDataFromJson(jsonString: string): Promise<Thought[]> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed.thoughts)) {
      throw new Error('Invalid format: thoughts list not found');
    }

    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.clear();
      parsed.thoughts.forEach((t: Thought) => store.put(t));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    if (Array.isArray(parsed.topics)) {
      saveCustomTopics(parsed.topics);
    }
    if (parsed.settings) {
      saveStoredSettings(parsed.settings);
    }

    return parsed.thoughts;
  } catch (err) {
    console.error('Import failed', err);
    throw err;
  }
}

// LocalStorage settings & topics
export function getStoredSettings(): AppSettings {
  const defaults: AppSettings = {
    fontSize: 'standard',
    ambientSound: false,
    quietFocusMode: false,
    editorialQuotes: true,
  };

  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  } catch {
    return defaults;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function getCustomTopics(): string[] {
  try {
    const saved = localStorage.getItem(TOPICS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_TOPICS;
  } catch {
    return DEFAULT_TOPICS;
  }
}

export function saveCustomTopics(topics: string[]): void {
  try {
    localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
  } catch (e) {
    console.error('Failed to save topics', e);
  }
}
