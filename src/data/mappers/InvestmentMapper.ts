import { Investment, InvestmentType, RenewalType } from '../../domain/entities/Investment';
import { EntityNotFoundError } from '../../domain/errors';

export interface InvestmentRow {
  id: string;
  name: string;
  type: string;
  initialAmount: number;
  currentValue: number;
  purchaseDate: number;
  maturityDate: number | null;
  interestRate: number | null;
  installmentCount: number | null;
  renewalType: string | null;
  categoryId: string | null;
  notes: string | null;
  isActive: number;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export class InvestmentMapper {
  static toDatabase(investment: Investment): InvestmentRow {
    return {
      id: investment.id,
      name: investment.name,
      type: investment.type,
      initialAmount: investment.initialAmount,
      currentValue: investment.currentValue,
      purchaseDate: investment.purchaseDate.getTime(),
      maturityDate: investment.maturityDate?.getTime() ?? null,
      interestRate: investment.interestRate ?? null,
      installmentCount: investment.installmentCount ?? null,
      renewalType: investment.renewalType ?? null,
      categoryId: investment.categoryId ?? null,
      notes: investment.notes ?? null,
      isActive: investment.isActive ? 1 : 0,
      createdAt: investment.createdAt.getTime(),
      updatedAt: investment.updatedAt.getTime(),
      deletedAt: investment.deletedAt?.getTime() ?? null,
    };
  }

  static fromDatabase(row: InvestmentRow): Investment {
    return {
      id: row.id,
      name: row.name,
      type: InvestmentType.parse(row.type),
      initialAmount: row.initialAmount,
      currentValue: row.currentValue,
      purchaseDate: new Date(row.purchaseDate),
      maturityDate: row.maturityDate ? new Date(row.maturityDate) : undefined,
      interestRate: row.interestRate ?? undefined,
      installmentCount: row.installmentCount ?? undefined,
      renewalType: row.renewalType ? RenewalType.parse(row.renewalType) : undefined,
      categoryId: row.categoryId ?? undefined,
      notes: row.notes ?? undefined,
      isActive: row.isActive === 1,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      deletedAt: row.deletedAt ? new Date(row.deletedAt) : undefined,
    };
  }
}

export { EntityNotFoundError };
