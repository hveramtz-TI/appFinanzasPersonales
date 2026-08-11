import { useState, useEffect, useMemo } from 'react';
import * as SQLite from 'expo-sqlite';
import { TransactionRepository } from '../../../data/local/repositories/TransactionRepository';
import { InvestmentRepository } from '../../../data/local/repositories/InvestmentRepository';
import { getDatabase } from '../../../data/local/database';
import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { IInvestmentRepository } from '../../../domain/repositories/IInvestmentRepository';
import { useFinanceIndicators } from './useFinanceIndicators';

export function useFinanceScreen() {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const transactionRepo = useMemo<ITransactionRepository | null>(
    () => (db ? new TransactionRepository(db) : null),
    [db]
  );

  const investmentRepo = useMemo<IInvestmentRepository | null>(
    () => (db ? new InvestmentRepository(db) : null),
    [db]
  );

  const indicators = useFinanceIndicators(transactionRepo);

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
    ...indicators,
    transactionRepo,
    investmentRepo,
    isInitializing,
    initError: error,
  };
}
