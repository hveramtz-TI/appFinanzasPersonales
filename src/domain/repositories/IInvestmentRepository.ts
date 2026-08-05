import { Investment, CreateInvestment, UpdateInvestment } from '../entities/Investment';

export interface IInvestmentRepository {
  getAll(includeInactive?: boolean): Promise<Investment[]>;
  getById(id: string): Promise<Investment | null>;
  getByType(type: 'DP' | 'FM'): Promise<Investment[]>;
  getActive(): Promise<Investment[]>;
  getMatured(): Promise<Investment[]>;
  getTotalCurrentValue(): Promise<number>;
  create(investment: CreateInvestment): Promise<Investment>;
  update(id: string, investment: UpdateInvestment): Promise<Investment>;
  delete(id: string): Promise<void>;
}
