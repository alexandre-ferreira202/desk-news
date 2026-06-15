import { useState, useEffect, useRef } from 'react';

const DB_NAME = 'desknews_drafts';
const STORE_NAME = 'drafts';

// Cria a conexão com o banco local do navegador (IndexedDB)
const openDB = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

// Salva os dados silenciosamente
export async function autosave(id: string, feature: string, data: any) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(data, `${feature}_${id}`);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Recupera os dados caso caia a energia ou o usuário feche a aba
export async function restoreDraft(id: string, feature: string) {
  const db = await openDB();
  return new Promise<any>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(`${feature}_${id}`);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Hook React para monitorar a digitação
export function useAutosave(draftId: string, feature: string, data: any, delay: number = 1500) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!draftId) return;
    setIsSaving(true);
    
    // Cancela o save anterior se o usuário continuar digitando
    clearTimeout(timeoutRef.current);
    
    // Só salva no banco após 1.5s de pausa na digitação
    timeoutRef.current = setTimeout(async () => {
      await autosave(draftId, feature, data);
      setLastSaved(new Date());
      setIsSaving(false);
    }, delay);

  // O JSON.stringify garante que só salve se o conteúdo real mudar
  }, [draftId, feature, JSON.stringify(data), delay]);

  return { isSaving, lastSaved };
}