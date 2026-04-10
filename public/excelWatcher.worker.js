/**
 * Web Worker for monitoring Excel file changes
 * Runs in a background thread to avoid blocking the UI
 * Checks file's lastModified timestamp every 5 seconds
 */

/**
 * @typedef {Object} WorkerMessage
 * @property {"start-watching"|"stop-watching"|"get-file-status"} type
 * @property {FileSystemFileHandle} [fileHandle]
 * @property {number} [interval]
 */

/**
 * @typedef {Object} WorkerResponse
 * @property {"file-changed"|"file-unchanged"|"error"|"status"} type
 * @property {number} [lastModified]
 * @property {string} [fileName]
 * @property {string} [error]
 */

let currentFileHandle = null;
let lastModifiedTime = 0;
let watchingInterval = null;

async function checkFileForChanges() {
  if (!currentFileHandle) {
    return false;
  }

  try {
    const file = await currentFileHandle.getFile();
    const currentModified = file.lastModified;

    if (lastModifiedTime === 0) {
      lastModifiedTime = currentModified;
      return false;
    }

    if (currentModified !== lastModifiedTime) {
      lastModifiedTime = currentModified;
      return true;
    }

    return false;
  } catch (error) {
    throw new Error(
      `Cannot access file: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

function startWatching(fileHandle, interval = 5000) {
  if (watchingInterval) {
    clearInterval(watchingInterval);
  }

  currentFileHandle = fileHandle;
  lastModifiedTime = 0;

  watchingInterval = setInterval(async () => {
    try {
      const hasChanged = await checkFileForChanges();

      if (hasChanged) {
        self.postMessage({
          type: "file-changed",
          lastModified: lastModifiedTime,
        });
      }
    } catch (error) {
      self.postMessage({
        type: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      stopWatching();
    }
  }, interval);
}

function stopWatching() {
  if (watchingInterval) {
    clearInterval(watchingInterval);
    watchingInterval = null;
  }
  currentFileHandle = null;
  lastModifiedTime = 0;
}

async function getFileStatus() {
  if (!currentFileHandle) {
    return {
      type: "status",
      error: "No file being watched",
    };
  }

  try {
    const file = await currentFileHandle.getFile();
    return {
      type: "status",
      fileName: file.name,
      lastModified: file.lastModified,
    };
  } catch (error) {
    return {
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

self.onmessage = async (event) => {
  const { type, fileHandle, interval } = event.data;
  try {
    if (type === "start-watching" && fileHandle) {
      startWatching(fileHandle, interval);
      self.postMessage({
        type: "status",
        fileName: fileHandle.name,
      });
    } else if (type === "stop-watching") {
      stopWatching();
      self.postMessage({ type: "status" });
    } else if (type === "get-file-status") {
      const response = await getFileStatus();
      self.postMessage(response);
    }
  } catch (error) {
    self.postMessage({
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
