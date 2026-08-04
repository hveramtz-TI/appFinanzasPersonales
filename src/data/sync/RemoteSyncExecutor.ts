import { SupabaseClient } from '@supabase/supabase-js';
import { SyncQueueItem } from './types';

export class RemoteSyncExecutor {
  constructor(private supabase: SupabaseClient) {}

  async execute(item: SyncQueueItem): Promise<void> {
    const payload = JSON.parse(item.payload);
    const { entityType, entityId, operation } = item;

    switch (operation) {
      case 'INSERT':
      case 'UPDATE':
        await this.supabase
          .from(entityType)
          .upsert({ ...payload, id: entityId }, { onConflict: 'id' });
        break;
      case 'DELETE':
        await this.supabase
          .from(entityType)
          .delete()
          .eq('id', entityId);
        break;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await this.supabase.auth.getSession();
    return !!session;
  }
}
