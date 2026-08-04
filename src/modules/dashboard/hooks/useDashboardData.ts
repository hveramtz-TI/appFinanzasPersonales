import { useState, useEffect, useMemo } from 'react';
import * as SQLite from 'expo-sqlite';
import { TransactionRepository } from '../../../data/local/repositories/TransactionRepository';
import { CategoryRepository } from '../../../data/local/repositories/CategoryRepository';
import { getDatabase } from '../../../data/local/database';
import { GetDashboardDataUseCase, DashboardData } from '../../../domain/usecases/GetDashboardData';

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  const transactionRepo = useMemo(() => db ? new TransactionRepository(db) : null, [db]);
  const categoryRepo = useMemo(() => db ? new CategoryRepository(db) : null, [db]);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      const database = await getDatabase();
      setDb(database);
      await loadDashboardData(database);
      setLoading(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al inicializar base de datos';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const loadDashboardData = async (database: SQLite.SQLiteDatabase) => {
    const transactionRepo = new TransactionRepository(database);
    const categoryRepo = new CategoryRepository(database);
    const useCase = new GetDashboardDataUseCase(transactionRepo, categoryRepo);

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const dashboardData = await useCase.execute({ startDate, endDate });
    setData(dashboardData);
  };

  const refresh = async () => {
    if (!db) return;
    setLoading(true);
    await loadDashboardData(db);
    setLoading(false);
  };

  return {
    data,
    loading,
    error,
    refresh,
  };
}
