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

export interface Budget {
  // id is the category name
  userId: string;
  category: Category;
  amount: number;
}

export interface FuturePlan {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: Category;
  targetDate: string; // ISO 8601 date string
}
