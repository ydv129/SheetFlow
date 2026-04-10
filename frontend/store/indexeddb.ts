/**
 * IndexedDB utilities for storing FileSystemFileHandle
 * This allows the app to remember Excel files between browser sessions
 * without asking for file access permission every time
 */

// Database name and store name - these are constants
const DB_NAME = "SheetFlowDB";
const STORE_NAME = "fileHandles";

/**
 * Open a connection to IndexedDB
 * IndexedDB is like a small database stored right in the browser
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    // If the database is new, we need to set it up
    request.onupgradeneeded = () => {
      const db = request.result;
      // Create a store to hold file handles
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB database"));
    };
  });
}

/**
 * Save a FileSystemFileHandle to IndexedDB
 * @param fileHandle - The handle returned by showOpenFilePicker
 * @param key - Unique identifier (usually the file name)
 */
export async function saveFileHandle(
  fileHandle: FileSystemFileHandle,
  key: string
): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      // Store the file handle with a unique key
      const request = store.put(fileHandle, key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error("Failed to save file handle"));
      };
    });
  } catch (error) {
    console.error("Error saving file handle:", error);
    throw error;
  }
}

/**
 * Retrieve a FileSystemFileHandle from IndexedDB
 * @param key - The key used when saving
 */
export async function getFileHandle(
  key: string
): Promise<FileSystemFileHandle | undefined> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(key);

      request.onsuccess = () => {
        // If we got a handle, verify it still has permission to access the file
        const handle = request.result;
        if (handle) {
          // Try to verify permission - if it fails, the handle is stale
          verifyFileHandlePermission(handle)
            .then((hasPermission) => {
              resolve(hasPermission ? handle : undefined);
            })
            .catch(() => {
              resolve(undefined);
            });
        } else {
          resolve(undefined);
        }
      };

      request.onerror = () => {
        reject(new Error("Failed to retrieve file handle"));
      };
    });
  } catch (error) {
    console.error("Error retrieving file handle:", error);
    return undefined;
  }
}

/**
 * Delete a FileSystemFileHandle from IndexedDB
 * @param key - The key used when saving
 */
export async function deleteFileHandle(key: string): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error("Failed to delete file handle"));
      };
    });
  } catch (error) {
    console.error("Error deleting file handle:", error);
    throw error;
  }
}

/**
 * Check if a file handle still has permission to access the file
 * This is important because the file might have been deleted or moved
 */
async function verifyFileHandlePermission(
  handle: FileSystemFileHandle
): Promise<boolean> {
  try {
    // Try to get file metadata - this will fail if permission is gone
    const file = await handle.getFile();
    return file !== null;
  } catch {
    return false;
  }
}

/**
 * List all saved file handles in IndexedDB
 * Useful for showing user's previously opened files
 */
export async function listSavedFileHandles(): Promise<string[]> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAllKeys();

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };

      request.onerror = () => {
        reject(new Error("Failed to list file handles"));
      };
    });
  } catch (error) {
    console.error("Error listing file handles:", error);
    return [];
  }
}
