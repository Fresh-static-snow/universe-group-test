import { PDFFileHistory } from "./types";

export const initializeDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("PDFHistoryDB", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("pdfs")) {
        db.createObjectStore("pdfs", { keyPath: "name" });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject("Error opening IndexedDB");
    };
  });
};

export const savePdfToDB = async (file: File) => {
  const db = await initializeDB();
  const transaction = db.transaction("pdfs", "readwrite");
  const store = transaction.objectStore("pdfs");

  return new Promise<void>((resolve, reject) => {
    const request = store.put({ name: file.name, file });

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error saving PDF to IndexedDB");
  });
};

export const loadPdfsFromDB = async () => {
  const db = await initializeDB();
  const transaction = db.transaction("pdfs", "readonly");
  const store = transaction.objectStore("pdfs");

  return new Promise<PDFFileHistory[]>((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Error loading PDFs from IndexedDB");
  });
};
