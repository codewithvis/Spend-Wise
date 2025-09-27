export type Category =
  | 'Groceries'
  | 'Dining'
  | 'Transportation'
  | 'Entertainment'
  | 'Utilities'
  | 'Rent'
  | 'Salary'
  | 'Shopping'
  | 'Travel'
  | 'Other';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: Category;
  date: string; // ISO 8601 date string
}

export interface Budget {
  category: Category;
  amount: number;
}

export interface FuturePlan {
  id: string;
  description: string;
  amount: number;
  category: Category;
  targetDate: string; // ISO 8601 date string
}
