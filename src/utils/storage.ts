import { SceneryOption, SceneItem, CoupleData } from '../types';

const DB_NAME = 'PixarWeddingStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_keyval';

/**
 * Robust IndexedDB client-side database helper.
 * Handles large image data URLs without localStorage's 5MB quota limit.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

export async function getStoredItem<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve((req.result as T) ?? null);
      };

      req.onerror = () => {
        console.warn(`[storage] Error reading key "${key}":`, req.error);
        resolve(null);
      };
    });
  } catch (err) {
    console.warn(`[storage] IndexedDB get failed for ${key}, falling back:`, err);
    try {
      const local = localStorage.getItem(key);
      return local ? JSON.parse(local) : null;
    } catch {
      return null;
    }
  }
}

export async function setStoredItem<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);

      req.onsuccess = () => resolve();
      req.onerror = () => {
        console.warn(`[storage] Error saving key "${key}":`, req.error);
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn(`[storage] IndexedDB put failed for ${key}, falling back:`, err);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('[storage] localStorage fallback also failed:', e);
    }
  }
}

export async function removeStoredItem(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);

      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

// Keys
export const STORAGE_KEYS = {
  BRIDE_PHOTO: 'saved_bride_photo',
  GROOM_PHOTO: 'saved_groom_photo',
  CUSTOM_SCENERIES: 'saved_custom_sceneries',
  SAVED_SCENES: 'saved_scenes_list',
  SAVED_COUPLE: 'saved_couple_data',
};

// Convenience helpers
export async function loadSavedAppPhotos(): Promise<{
  bridePhoto: string | null;
  groomPhoto: string | null;
  customSceneries: SceneryOption[];
  savedScenes: SceneItem[] | null;
  savedCouple: CoupleData | null;
}> {
  const [bridePhoto, groomPhoto, customSceneries, savedScenes, savedCouple] = await Promise.all([
    getStoredItem<string>(STORAGE_KEYS.BRIDE_PHOTO),
    getStoredItem<string>(STORAGE_KEYS.GROOM_PHOTO),
    getStoredItem<SceneryOption[]>(STORAGE_KEYS.CUSTOM_SCENERIES),
    getStoredItem<SceneItem[]>(STORAGE_KEYS.SAVED_SCENES),
    getStoredItem<CoupleData>(STORAGE_KEYS.SAVED_COUPLE),
  ]);

  return {
    bridePhoto,
    groomPhoto,
    customSceneries: customSceneries || [],
    savedScenes,
    savedCouple,
  };
}

export async function persistBridePhoto(photoDataUrl: string | null): Promise<void> {
  if (photoDataUrl) {
    await setStoredItem(STORAGE_KEYS.BRIDE_PHOTO, photoDataUrl);
  } else {
    await removeStoredItem(STORAGE_KEYS.BRIDE_PHOTO);
  }
}

export async function persistGroomPhoto(photoDataUrl: string | null): Promise<void> {
  if (photoDataUrl) {
    await setStoredItem(STORAGE_KEYS.GROOM_PHOTO, photoDataUrl);
  } else {
    await removeStoredItem(STORAGE_KEYS.GROOM_PHOTO);
  }
}

export async function persistCustomSceneries(sceneries: SceneryOption[]): Promise<void> {
  await setStoredItem(STORAGE_KEYS.CUSTOM_SCENERIES, sceneries);
}

export async function persistSavedScenes(scenes: SceneItem[]): Promise<void> {
  await setStoredItem(STORAGE_KEYS.SAVED_SCENES, scenes);
}

export async function persistCoupleData(couple: CoupleData): Promise<void> {
  await setStoredItem(STORAGE_KEYS.SAVED_COUPLE, couple);
}
