const DB_NAME = "tianyuan-media";
const DB_VERSION = 1;
const STORE_NAME = "media-files";

interface MediaRecord {
  id: string;
  entityId: string;
  entityType: "beehive" | "poultry" | "cropPlot";
  blob: Blob;
  mimeType: string;
  createdAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Compress image to max 1200px wide, JPEG quality 0.7 */
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 1200;
      let w = img.width;
      let h = img.height;
      if (w > maxW) {
        h = (h * maxW) / w;
        w = maxW;
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.7);
    };
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadMedia(
  file: File,
  entityId: string,
  entityType: MediaRecord["entityType"],
): Promise<string> {
  const compressed = file.type.startsWith("image/") ? await compressImage(file) : file;
  const id = generateId();
  const record: MediaRecord = {
    id,
    entityId,
    entityType,
    blob: compressed,
    mimeType: "image/jpeg",
    createdAt: new Date().toISOString(),
  };

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.add(record);
    tx.oncomplete = () => resolve(id);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getMediaUrl(id: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => {
      const record = req.result as MediaRecord | undefined;
      if (record) {
        resolve(URL.createObjectURL(record.blob));
      } else {
        resolve(null);
      }
    };
    req.onerror = () => resolve(null);
  });
}

export async function getMediaForEntity(
  entityId: string,
  entityType: MediaRecord["entityType"],
): Promise<{ id: string; url: string }[]> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const all = req.result as MediaRecord[];
      const matches = all
        .filter((r) => r.entityId === entityId && r.entityType === entityType)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((r) => ({ id: r.id, url: URL.createObjectURL(r.blob) }));
      resolve(matches);
    };
    req.onerror = () => resolve([]);
  });
}

export async function deleteMedia(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteAllMediaForEntity(
  entityId: string,
  entityType: MediaRecord["entityType"],
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const req = store.getAll();
  req.onsuccess = () => {
    const all = req.result as MediaRecord[];
    const toDelete = all.filter((r) => r.entityId === entityId && r.entityType === entityType);
    for (const r of toDelete) {
      store.delete(r.id);
    }
  };
}
