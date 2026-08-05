import * as SQLite from 'expo-sqlite';
import { Investment, CreateInvestment, UpdateInvestment, InvestmentSchema } from '../../../domain/entities/Investment';
import { IInvestmentRepository } from '../../../domain/repositories/IInvestmentRepository';
import { EntityNotFoundError } from '../../../domain/errors';
import { InvestmentMapper, InvestmentRow } from '../../mappers/InvestmentMapper';
import { generateUUID } from '../../../shared/utils/uuid';

export class InvestmentRepository implements IInvestmentRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async getAll(includeInactive = false): Promise<Investment[]> {
    const query = includeInactive
      ? 'SELECT * FROM investments ORDER BY purchaseDate DESC'
      : 'SELECT * FROM investments WHERE deletedAt IS NULL ORDER BY purchaseDate DESC';

    const rows = await this.db.getAllAsync(query) as InvestmentRow[];
    return rows.map(row => InvestmentMapper.fromDatabase(row));
  }

  async getById(id: string): Promise<Investment | null> {
    const row = await this.db.getFirstAsync(
      'SELECT * FROM investments WHERE id = ?',
      id
    ) as InvestmentRow | null;
    return row ? InvestmentMapper.fromDatabase(row) : null;
  }

  async getByType(type: 'DP' | 'FM'): Promise<Investment[]> {
    const rows = await this.db.getAllAsync(
      'SELECT * FROM investments WHERE type = ? AND deletedAt IS NULL ORDER BY purchaseDate DESC',
      type
    ) as InvestmentRow[];
    return rows.map(row => InvestmentMapper.fromDatabase(row));
  }

  async getActive(): Promise<Investment[]> {
    const rows = await this.db.getAllAsync(
      'SELECT * FROM investments WHERE deletedAt IS NULL ORDER BY purchaseDate DESC'
    ) as InvestmentRow[];
    return rows.map(row => InvestmentMapper.fromDatabase(row));
  }

  async getMatured(): Promise<Investment[]> {
    const now = new Date().getTime();
    const rows = await this.db.getAllAsync(
      `SELECT * FROM investments
       WHERE maturityDate <= ?
         AND deletedAt IS NULL
         AND renewalType IS NOT NULL
       ORDER BY maturityDate ASC`,
      now
    ) as InvestmentRow[];
    return rows.map(row => InvestmentMapper.fromDatabase(row));
  }

  async getTotalCurrentValue(): Promise<number> {
    const result = await this.db.getFirstAsync<{ total: number }>(
      'SELECT SUM(currentValue) as total FROM investments WHERE deletedAt IS NULL'
    );
    return result?.total ?? 0;
  }

  async create(investment: CreateInvestment): Promise<Investment> {
    const id = generateUUID();
    const now = new Date();
    const fullInvestment = InvestmentSchema.parse({
      ...investment,
      id,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

    const dbData = InvestmentMapper.toDatabase(fullInvestment);

    await this.db.runAsync(
      `INSERT INTO investments (
        id, name, type, initialAmount, currentValue, purchaseDate,
        maturityDate, interestRate, installmentCount, renewalType,
        categoryId, notes, isActive, createdAt, updatedAt, deletedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dbData.id,
        dbData.name,
        dbData.type,
        dbData.initialAmount,
        dbData.currentValue,
        dbData.purchaseDate,
        dbData.maturityDate,
        dbData.interestRate,
        dbData.installmentCount,
        dbData.renewalType,
        dbData.categoryId,
        dbData.notes,
        dbData.isActive,
        dbData.createdAt,
        dbData.updatedAt,
        dbData.deletedAt,
      ]
    );

    return fullInvestment;
  }

  async update(id: string, investment: UpdateInvestment): Promise<Investment> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new EntityNotFoundError('Investment', id);
    }

    const updated = InvestmentSchema.parse({
      ...existing,
      ...investment,
      updatedAt: new Date(),
    });

    const dbData = InvestmentMapper.toDatabase(updated);

    await this.db.runAsync(
      `UPDATE investments SET
        name = ?, type = ?, initialAmount = ?, currentValue = ?, purchaseDate = ?,
        maturityDate = ?, interestRate = ?, installmentCount = ?, renewalType = ?,
        categoryId = ?, notes = ?, isActive = ?, updatedAt = ?
       WHERE id = ?`,
      [
        dbData.name,
        dbData.type,
        dbData.initialAmount,
        dbData.currentValue,
        dbData.purchaseDate,
        dbData.maturityDate,
        dbData.interestRate,
        dbData.installmentCount,
        dbData.renewalType,
        dbData.categoryId,
        dbData.notes,
        dbData.isActive,
        dbData.updatedAt,
        id,
      ]
    );

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE investments SET deletedAt = ?, isActive = 0 WHERE id = ?',
      [new Date().getTime(), id]
    );
  }
}
