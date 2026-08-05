import { z } from 'zod';

export const InvestmentType = z.enum(['DP', 'FM']);
export type InvestmentType = z.infer<typeof InvestmentType>;

export const RenewalType = z.enum(['fixed', 'renewable']);
export type RenewalType = z.infer<typeof RenewalType>;

export const InvestmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: InvestmentType,
  initialAmount: z.number().positive(),
  currentValue: z.number().min(0),
  purchaseDate: z.coerce.date(),
  maturityDate: z.coerce.date().optional(),
  interestRate: z.number().min(0).optional(),
  installmentCount: z.number().int().positive().optional(),
  renewalType: RenewalType.optional(),
  categoryId: z.string().uuid().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'DP') {
    if (data.maturityDate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'maturityDate is required for DP investments',
        path: ['maturityDate'],
      });
    }
    if (data.interestRate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'interestRate is required for DP investments',
        path: ['interestRate'],
      });
    }
    if (data.renewalType === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'renewalType is required for DP investments',
        path: ['renewalType'],
      });
    }
  }

  if (data.type === 'FM') {
    if (data.installmentCount === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'installmentCount is required for FM investments',
        path: ['installmentCount'],
      });
    }
  }
});

export type Investment = z.infer<typeof InvestmentSchema>;

export type CreateInvestment = Omit<Investment, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateInvestment = Partial<CreateInvestment>;
