# Entity Field Reference

| Entity | Key Fields |
|--------|-----------|
| Transaction | amount, type (income/expense), categoryId, date |
| Category | name, icon, color, type, parentId (hierarchy) |
| Budget | categoryId, amount, period, alertThreshold |
| Reminder | title, amount, frequency, nextDate, payee |
| Investment | type (DP/FM/stock), amount, currentValue, purchaseDate |
