'use client';

import type { Expense, Budget, Category } from '@/lib/types';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SpendWiseContextType {
  expenses: Expense[];
  budgets: Budget[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  editExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  setBudgets: (budgets: Budget[]) => void;
  getBudgetForCategory: (category: Category) => number;
  getSpentForCategory: (category: Category) => number;
}

const SpendWiseContext = createContext<SpendWiseContextType | undefined>(undefined);

const getInitialExpenses = (): Expense[] => {
  if (typeof window === 'undefined') return [];
  const storedExpenses = localStorage.getItem('spendwise_expenses');
  if (storedExpenses) {
    try {
      const parsed = JSON.parse(storedExpenses);
      // Basic validation
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error("Failed to parse expenses from localStorage", e);
      return [];
    }
  }
  // Dummy data for initial load
  return [
    { id: '1', description: "Trader Joe's", amount: 85.4, category: 'Groceries', date: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: '2', description: 'Monthly Rent', amount: 1500, category: 'Rent', date: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: '3', description: 'Gas', amount: 45.0, category: 'Transportation', date: new Date(Date.now() - 4 * 86400000).toISOString() },
    { id: '4', description: 'Movie Tickets', amount: 30.0, category: 'Entertainment', date: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: '5', description: 'Paycheck', amount: -2500, category: 'Salary', date: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: '6', description: 'Dinner with friends', amount: 75.50, category: 'Dining', date: new Date(Date.now() - 6 * 86400000).toISOString() },
  ];
};

const getInitialBudgets = (): Budget[] => {
  if (typeof window === 'undefined') return [];
  const storedBudgets = localStorage.getItem('spendwise_budgets');
   if (storedBudgets) {
     try {
        const parsed = JSON.parse(storedBudgets);
        // Basic validation
        if (Array.isArray(parsed)) return parsed;
     } catch(e) {
        console.error("Failed to parse budgets from localStorage", e);
        return [];
     }
  }
  return [
    { category: 'Groceries', amount: 400 },
    { category: 'Dining', amount: 200 },
    { category: 'Transportation', amount: 150 },
    { category: 'Entertainment', amount: 100 },
    { category: 'Utilities', amount: 250 },
    { category: 'Rent', amount: 1500 },
    { category: 'Shopping', amount: 300 },
  ];
};

export function SpendWiseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgetsState] = useState<Budget[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setExpenses(getInitialExpenses());
    setBudgetsState(getInitialBudgets());
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('spendwise_expenses', JSON.stringify(expenses));
    }
  }, [expenses, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('spendwise_budgets', JSON.stringify(budgets));
    }
  }, [budgets, isMounted]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: new Date().getTime().toString() };
    setExpenses(prev => [newExpense, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const editExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }

  const setBudgets = (newBudgets: Budget[]) => {
    setBudgetsState(newBudgets);
  };

  const getBudgetForCategory = (category: Category) => {
    return budgets.find(b => b.category === category)?.amount || 0;
  };
  
  const getSpentForCategory = (category: Category) => {
    const now = new Date();
    return expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return e.category === category && e.amount > 0 && expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);
  };


  const value = {
    expenses,
    budgets,
    addExpense,
    editExpense,
    deleteExpense,
    setBudgets,
    getBudgetForCategory,
    getSpentForCategory,
  };

  return <SpendWiseContext.Provider value={value}>{children}</SpendWiseContext.Provider>;
}

export function useSpendWise() {
  const context = useContext(SpendWiseContext);
  if (context === undefined) {
    throw new Error('useSpendWise must be used within a SpendWiseProvider');
  }
  return context;
}
