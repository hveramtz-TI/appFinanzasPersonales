import { useState, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import { getDatabase } from '../../data/local/database';
import { SyncQueueRepository } from '../../data/sync/SyncQueueRepository';
import { RemoteSyncExecutor } from '../../data/sync/RemoteSyncExecutor';
import { SyncOrchestrator } from '../../data/sync/SyncOrchestrator';
import { getSupabaseClient } from '../../data/remote/client';
import { useOnlineStatus } from './useOnlineStatus';

export function useSync() {
  const { isOnline } = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);

  const sync = useCallback(async () => {
    if (!isOnline || syncing) return;

    setSyncing(true);
    try {
      const db = await getDatabase();
      const supabase = getSupabaseClient();
      const queueRepo = new SyncQueueRepository(db);
      const executor = new RemoteSyncExecutor(supabase);
      const orchestrator = new SyncOrchestrator(queueRepo, executor);
      
      await orchestrator.syncPendingChanges();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  }, [isOnline, syncing]);

  return {
    sync,
    syncing,
    isOnline,
  };
}
