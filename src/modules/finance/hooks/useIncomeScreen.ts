import { useState, useEffect, useMemo } from 'react';
import * as SQLite from 'expo-sqlite';
import { TransactionRepository } from '../../../data/local/repositories/TransactionRepository';
import { getDatabase } from '../../../data/local/database';
import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';

interface UseIncomeScreenResult {
  transactionRepo: ITransactionRepository | null;
  isInitializing: boolean;
  initError: string | null;
}

export function useIncomeScreen(): UseIncomeScreenResult {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const transactionRepo = useMemo<ITransactionRepository | null>(
    () => (db ? new TransactionRepository(db) : null),
    [db]
  );

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      const database = await getDatabase();
      setDb(database);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error al inicializar base de datos';
      setError(errorMessage);
    } finally {
      setIsInitializing(false);
    }
  };

  return {
    transactionRepo,
    isInitializing,
    initError: error,
  };
}
