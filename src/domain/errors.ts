export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class InvalidAmountError extends DomainError {
  constructor(message = 'Amount must be positive') {
    super(message);
    this.name = 'InvalidAmountError';
  }
}

export class AmountExceededError extends DomainError {
  constructor(max: number) {
    super(`Amount exceeds maximum allowed (${max})`);
    this.name = 'AmountExceededError';
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`);
    this.name = 'EntityNotFoundError';
  }
}

export class InactiveEntityError extends DomainError {
  constructor(entity: string) {
    super(`Cannot modify inactive ${entity}`);
    this.name = 'InactiveEntityError';
  }
}

export class InvalidDateError extends DomainError {
  constructor(message = 'Date must be in the future') {
    super(message);
    this.name = 'InvalidDateError';
  }
}

export class EmptyFieldError extends DomainError {
  constructor(field: string) {
    super(`${field} cannot be empty`);
    this.name = 'EmptyFieldError';
  }
}
