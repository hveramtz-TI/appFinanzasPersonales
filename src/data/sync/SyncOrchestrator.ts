import { AppState, AppStateStatus } from 'react-native';
import { SyncQueueRepository } from './SyncQueueRepository';
import { RemoteSyncExecutor } from './RemoteSyncExecutor';
import { MAX_SYNC_RETRIES, SYNC_BATCH_SIZE } from '../../shared/constants/business';

export class SyncOrchestrator {
  private isSyncing = false;
  private appStateSubscription: any;

  constructor(
    private queueRepository: SyncQueueRepository,
    private remoteExecutor: RemoteSyncExecutor
  ) {
    this.setupAppStateListener();
  }

  private setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        this.syncPendingChanges().catch(console.error);
      }
    });
  }

  async syncPendingChanges(): Promise<void> {
    if (this.isSyncing) {
      return;
    }

    this.isSyncing = true;

    try {
      const isAuthenticated = await this.remoteExecutor.isAuthenticated();
      if (!isAuthenticated) {
        console.log('No active session, skipping sync');
        return;
      }

      const pending = await this.queueRepository.getPending(SYNC_BATCH_SIZE, MAX_SYNC_RETRIES);

      if (pending.length === 0) {
        return;
      }

      console.log(`Syncing ${pending.length} pending changes`);

      for (const item of pending) {
        try {
          await this.remoteExecutor.execute(item);
          await this.queueRepository.remove(item.id);
        } catch (error) {
          console.error('Sync error for item', item.id, error);
          await this.handleSyncError(item);
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private async handleSyncError(item: any): Promise<void> {
    const newRetryCount = item.retryCount + 1;

    if (newRetryCount >= MAX_SYNC_RETRIES) {
      console.error('Max retries reached for sync item', item.id);
      await this.queueRepository.remove(item.id);
    } else {
      await this.queueRepository.incrementRetryCount(item.id);
    }
  }

  dispose() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }
}
