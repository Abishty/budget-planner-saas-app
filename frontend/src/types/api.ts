export type CategoryRow = {
  id: string;
  name: string;
  type: string;
  color?: string | null;
};

export type TransactionRow = {
  id: string;
  amount: number;
  description?: string | null;
  date: string;
  type: string;
  category?: { id: string; name: string } | null;
};

export type BudgetRow = {
  id: string;
  amount: number;
  period: string;
  startDate: string;
  category: { id: string; name: string };
};

export type GoalRow = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
};

export type CategorySpendRow = {
  categoryId: string;
  categoryName: string;
  amount: number;
};
