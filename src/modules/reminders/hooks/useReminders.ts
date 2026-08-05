import { useState, useEffect, useMemo } from 'react';
import * as SQLite from 'expo-sqlite';
import { Reminder, CreateReminder } from '../../../domain/entities/Reminder';
import { ReminderRepository } from '../../../data/local/repositories/ReminderRepository';
import { TransactionRepository } from '../../../data/local/repositories/TransactionRepository';
import { getDatabase } from '../../../data/local/database';
import { CreateReminderUseCase } from '../../../domain/usecases/CreateReminder';
import { MarkReminderAsPaidUseCase } from '../../../domain/usecases/MarkReminderAsPaid';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  const reminderRepo = useMemo(() => db ? new ReminderRepository(db) : null, [db]);
  const transactionRepo = useMemo(() => db ? new TransactionRepository(db) : null, [db]);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      const database = await getDatabase();
      setDb(database);
      await loadReminders(database);
      setLoading(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al inicializar base de datos';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const loadReminders = async (database: SQLite.SQLiteDatabase) => {
    const repo = new ReminderRepository(database);
    const data = await repo.getAll();
    setReminders(data);
  };

  const addReminder = async (data: CreateReminder) => {
    if (!reminderRepo) return;
    
    const useCase = new CreateReminderUseCase(reminderRepo);
    const reminder = await useCase.execute(data);
    
    setReminders(prev => [reminder, ...prev]);
    return reminder;
  };

  const deleteReminder = async (id: string) => {
    if (!reminderRepo) return;
    
    await reminderRepo.delete(id);
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const markAsPaid = async (id: string) => {
    if (!reminderRepo || !transactionRepo || !db) return;
    
    const useCase = new MarkReminderAsPaidUseCase(reminderRepo, transactionRepo);
    const updated = await useCase.execute(id);
    setReminders(prev => prev.map(r => r.id === id ? updated : r));
  };

  const refresh = async () => {
    if (!db) return;
    setLoading(true);
    await loadReminders(db);
    setLoading(false);
  };

  return {
    reminders,
    loading,
    error,
    addReminder,
    deleteReminder,
    markAsPaid,
    refresh,
  };
}
