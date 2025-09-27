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
  userId: string;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO 8601 date string
}

export interface SpendingEntry {
  id: string;
  amount: number;
  date: string; // ISO 8601 date string
}

export interface Budget {
  // id is the category name
  userId: string;
  category: Category;
  amount: number;
  spent?: number; // Kept for backwards compatibility, but spendingHistory is preferred
  spendingHistory?: SpendingEntry[];
}

export interface FuturePlan {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: Category;
  targetDate: string; // ISO 8601 date string
}
