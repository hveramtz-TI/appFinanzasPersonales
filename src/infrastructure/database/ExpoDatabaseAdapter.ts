import { DatabaseConnectionFactory, DatabasePort } from '../../application/ports/DatabasePort';
import { getDatabase as getExpoDatabase } from '../../data/local/database';

export class ExpoDatabaseAdapter implements DatabaseConnectionFactory {
  async getDatabase(): Promise<DatabasePort> {
    return getExpoDatabase();
  }
}
