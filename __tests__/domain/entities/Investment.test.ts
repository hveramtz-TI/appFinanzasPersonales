import { InvestmentSchema, InvestmentType } from '@domain/entities/Investment';

const baseDP = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Plazo fijo',
  type: 'DP' as InvestmentType,
  initialAmount: 10000,
  currentValue: 10500,
  purchaseDate: new Date(),
  maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  interestRate: 30,
  renewalType: 'fixed' as const,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseFM = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'Fondo común de inversión',
  type: 'FM' as InvestmentType,
  initialAmount: 5000,
  currentValue: 5200,
  purchaseDate: new Date(),
  installmentCount: 12,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Investment Entity', () => {
  it('should create a valid DP investment', () => {
    const investment = InvestmentSchema.parse(baseDP);

    expect(investment.name).toBe('Plazo fijo');
    expect(investment.type).toBe('DP');
    expect(investment.maturityDate).toBeDefined();
    expect(investment.interestRate).toBe(30);
    expect(investment.renewalType).toBe('fixed');
  });

  it('should create a valid FM investment', () => {
    const investment = InvestmentSchema.parse(baseFM);

    expect(investment.name).toBe('Fondo común de inversión');
    expect(investment.type).toBe('FM');
    expect(investment.installmentCount).toBe(12);
  });

  it('should reject invalid DP investment missing maturityDate', () => {
    expect(() => {
      InvestmentSchema.parse({
        ...baseDP,
        maturityDate: undefined,
      });
    }).toThrow();
  });

  it('should reject invalid FM investment missing installmentCount', () => {
    expect(() => {
      InvestmentSchema.parse({
        ...baseFM,
        installmentCount: undefined,
      });
    }).toThrow();
  });

  it('should validate type change from DP to FM', () => {
    expect(() => {
      InvestmentSchema.parse({
        ...baseDP,
        type: 'FM',
        installmentCount: undefined,
      });
    }).toThrow();

    const changedToFM = InvestmentSchema.parse({
      ...baseDP,
      type: 'FM',
      installmentCount: 24,
    });

    expect(changedToFM.type).toBe('FM');
    expect(changedToFM.installmentCount).toBe(24);
  });
});
