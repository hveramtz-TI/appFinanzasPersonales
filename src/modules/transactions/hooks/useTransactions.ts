import { useState, useEffect, useMemo } from 'react';
import * as SQLite from 'expo-sqlite';
import { Transaction, CreateTransaction } from '../../../domain/entities/Transaction';
import { Category } from '../../../domain/entities/Category';
import { TransactionRepository } from '../../../data/local/repositories/TransactionRepository';
import { CategoryRepository } from '../../../data/local/repositories/CategoryRepository';
import { getDatabase } from '../../../data/local/database';
import { CreateTransactionUseCase } from '../../../domain/usecases/CreateTransaction';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
      await loadTransactions(database);
      await loadCategories(database);
      setLoading(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al inicializar base de datos';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const loadTransactions = async (database: SQLite.SQLiteDatabase) => {
    const repo = new TransactionRepository(database);
    const data = await repo.getAll();
    setTransactions(data);
  };

  const loadCategories = async (database: SQLite.SQLiteDatabase) => {
    const repo = new CategoryRepository(database);
    const data = await repo.getAll();
    setCategories(data);
  };

  const addTransaction = async (data: CreateTransaction) => {
    if (!transactionRepo) return;
    
    const useCase = new CreateTransactionUseCase(transactionRepo);
    const transaction = await useCase.execute(data);
    
    setTransactions(prev => [transaction, ...prev]);
    return transaction;
  };

  const deleteTransaction = async (id: string) => {
    if (!transactionRepo) return;
    
    await transactionRepo.delete(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const refresh = async () => {
    if (!db) return;
    setLoading(true);
    await loadTransactions(db);
    setLoading(false);
  };

  return {
    transactions,
    categories,
    loading,
    error,
    addTransaction,
    deleteTransaction,
    refresh,
  };
}
