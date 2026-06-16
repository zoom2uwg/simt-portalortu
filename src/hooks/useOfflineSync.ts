'use client';

// ============================================================
// SIMT Portal Ortu — useOfflineSync Hook
// Deteksi status online/offline dan trigger sync queue
// ============================================================
import { useState, useEffect, useCallback, useRef } from 'react';
import { processSyncQueue, getPendingSyncCount } from '@/lib/sync-manager';

export interface OfflineSyncState {
  isOnline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  lastSyncAt: Date | null;
  triggerSync: () => Promise<void>;
}

export function useOfflineSync(): OfflineSyncState {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const syncInProgress = useRef(false);

  // Update pending count dari IndexedDB
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingSyncCount();
      setPendingSyncCount(count);
    } catch {
      // IndexedDB mungkin belum tersedia
    }
  }, []);

  // Trigger manual sync
  const triggerSync = useCallback(async () => {
    if (!navigator.onLine || syncInProgress.current) return;
    syncInProgress.current = true;
    setIsSyncing(true);

    try {
      const result = await processSyncQueue();
      if (result.processed > 0 || result.failed > 0) {
        setLastSyncAt(new Date());
        await refreshPendingCount();
      }
    } catch (err) {
      console.warn('[useOfflineSync] Sync error:', err);
    } finally {
      syncInProgress.current = false;
      setIsSyncing(false);
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Delay sedikit untuk memastikan koneksi stabil
      setTimeout(() => triggerSync(), 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    refreshPendingCount();

    // Polling fallback untuk iOS Safari (tidak support Background Sync API)
    const pollingInterval = setInterval(async () => {
      if (navigator.onLine) {
        const count = await getPendingSyncCount();
        if (count > 0) await triggerSync();
      }
    }, 30_000); // Setiap 30 detik

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pollingInterval);
    };
  }, [triggerSync, refreshPendingCount]);

  return {
    isOnline,
    pendingSyncCount,
    isSyncing,
    lastSyncAt,
    triggerSync,
  };
}
