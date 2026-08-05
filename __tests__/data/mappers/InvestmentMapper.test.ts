import { InvestmentSchema, InvestmentType, RenewalType } from '@domain/entities/Investment';
import { InvestmentMapper } from '@data/mappers/InvestmentMapper';

const baseDP = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Plazo fijo',
  type: 'DP' as InvestmentType,
  initialAmount: 10000,
  currentValue: 10500,
  purchaseDate: new Date('2024-01-15T00:00:00.000Z'),
  maturityDate: new Date('2024-07-15T00:00:00.000Z'),
  interestRate: 30,
  renewalType: 'fixed' as RenewalType,
  categoryId: '123e4567-e89b-12d3-a456-426614174010',
  notes: 'DP a 6 meses',
  isActive: true,
  createdAt: new Date('2024-01-15T10:00:00.000Z'),
  updatedAt: new Date('2024-01-15T10:00:00.000Z'),
};

const baseFM = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'Fondo común de inversión',
  type: 'FM' as InvestmentType,
  initialAmount: 5000,
  currentValue: 5200,
  purchaseDate: new Date('2024-02-01T00:00:00.000Z'),
  installmentCount: 12,
  categoryId: '123e4567-e89b-12d3-a456-426614174011',
  notes: 'FM mensual',
  isActive: true,
  createdAt: new Date('2024-02-01T10:00:00.000Z'),
  updatedAt: new Date('2024-02-01T10:00:00.000Z'),
};

describe('InvestmentMapper', () => {
  it('should round-trip a DP investment to and from the database', () => {
    const investment = InvestmentSchema.parse(baseDP);
    const row = InvestmentMapper.toDatabase(investment);
    const restored = InvestmentMapper.fromDatabase(row);

    expect(restored.id).toBe(investment.id);
    expect(restored.name).toBe(investment.name);
    expect(restored.type).toBe('DP');
    expect(restored.initialAmount).toBe(investment.initialAmount);
    expect(restored.currentValue).toBe(investment.currentValue);
    expect(restored.purchaseDate.getTime()).toBe(investment.purchaseDate.getTime());
    expect(restored.maturityDate?.getTime()).toBe(investment.maturityDate?.getTime());
    expect(restored.interestRate).toBe(investment.interestRate);
    expect(restored.renewalType).toBe(investment.renewalType);
    expect(restored.categoryId).toBe(investment.categoryId);
    expect(restored.notes).toBe(investment.notes);
    expect(restored.isActive).toBe(investment.isActive);
    expect(restored.createdAt.getTime()).toBe(investment.createdAt.getTime());
    expect(restored.updatedAt.getTime()).toBe(investment.updatedAt.getTime());
    expect(restored.deletedAt).toBeUndefined();
  });

  it('should round-trip an FM investment to and from the database', () => {
    const investment = InvestmentSchema.parse(baseFM);
    const row = InvestmentMapper.toDatabase(investment);
    const restored = InvestmentMapper.fromDatabase(row);

    expect(restored.id).toBe(investment.id);
    expect(restored.name).toBe(investment.name);
    expect(restored.type).toBe('FM');
    expect(restored.initialAmount).toBe(investment.initialAmount);
    expect(restored.currentValue).toBe(investment.currentValue);
    expect(restored.purchaseDate.getTime()).toBe(investment.purchaseDate.getTime());
    expect(restored.installmentCount).toBe(investment.installmentCount);
    expect(restored.maturityDate).toBeUndefined();
    expect(restored.interestRate).toBeUndefined();
    expect(restored.renewalType).toBeUndefined();
    expect(restored.categoryId).toBe(investment.categoryId);
    expect(restored.notes).toBe(investment.notes);
    expect(restored.isActive).toBe(investment.isActive);
    expect(restored.createdAt.getTime()).toBe(investment.createdAt.getTime());
    expect(restored.updatedAt.getTime()).toBe(investment.updatedAt.getTime());
    expect(restored.deletedAt).toBeUndefined();
  });

  it('should handle null optional fields by mapping them to undefined', () => {
    const investment = InvestmentSchema.parse({
      ...baseFM,
      maturityDate: undefined,
      interestRate: undefined,
      renewalType: undefined,
      categoryId: undefined,
      notes: undefined,
      deletedAt: undefined,
    });
    const row = InvestmentMapper.toDatabase(investment);

    expect(row.maturityDate).toBeNull();
    expect(row.interestRate).toBeNull();
    expect(row.renewalType).toBeNull();
    expect(row.installmentCount).toBe(investment.installmentCount);
    expect(row.categoryId).toBeNull();
    expect(row.notes).toBeNull();
    expect(row.deletedAt).toBeNull();

    const restored = InvestmentMapper.fromDatabase(row);

    expect(restored.maturityDate).toBeUndefined();
    expect(restored.interestRate).toBeUndefined();
    expect(restored.renewalType).toBeUndefined();
    expect(restored.installmentCount).toBe(investment.installmentCount);
    expect(restored.categoryId).toBeUndefined();
    expect(restored.notes).toBeUndefined();
    expect(restored.deletedAt).toBeUndefined();
  });
});
