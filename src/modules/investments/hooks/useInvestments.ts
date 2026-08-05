import { useState, useEffect, useMemo } from 'react';
import * as SQLite from 'expo-sqlite';
import { Investment, CreateInvestment } from '../../../domain/entities/Investment';
import { InvestmentRepository } from '../../../data/local/repositories/InvestmentRepository';
import { getDatabase } from '../../../data/local/database';

export function useInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  const investmentRepo = useMemo(() => db ? new InvestmentRepository(db) : null, [db]);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      const database = await getDatabase();
      setDb(database);
      await loadInvestments(database);
      setLoading(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al inicializar base de datos';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const loadInvestments = async (database: SQLite.SQLiteDatabase) => {
    const repo = new InvestmentRepository(database);
    const data = await repo.getAll();
    setInvestments(data);
  };

  const addInvestment = async (data: CreateInvestment) => {
    if (!investmentRepo) return;

    const investment = await investmentRepo.create(data);
    setInvestments(prev => [investment, ...prev]);
    return investment;
  };

  const deleteInvestment = async (id: string) => {
    if (!investmentRepo) return;

    await investmentRepo.delete(id);
    setInvestments(prev => prev.filter(i => i.id !== id));
  };

  const refresh = async () => {
    if (!db) return;
    setLoading(true);
    await loadInvestments(db);
    setLoading(false);
  };

  return {
    investments,
    loading,
    error,
    addInvestment,
    deleteInvestment,
    refresh,
  };
}
