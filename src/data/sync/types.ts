export interface SyncQueueItem {
  id: string;
  entityType: string;
  entityId: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: string;
  retryCount: number;
  createdAt: number;
}
