'use client';

import type { Expense, Budget, Category, FuturePlan } from '@/lib/types';
import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import {
  setDocumentNonBlocking,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import type { WithId } from '@/firebase/firestore/use-collection';

interface SpendWiseContextType {
  expenses: WithId<Expense>[];
  budgets: WithId<Budget>[];
  futurePlans: WithId<FuturePlan>[];
  addExpense: (expense: Omit<Expense, 'id' | 'userId'>) => void;
  editExpense: (expense: WithId<Expense>) => void;
  deleteExpense: (id: string) => void;
  setBudgets: (budgets: Omit<Budget, 'userId'>[]) => void;
  getBudgetForCategory: (category: Category) => number;
  getSpentForCategory: (category: Category) => number;
  addFuturePlan: (plan: Omit<FuturePlan, 'id' | 'userId'>) => void;
  editFuturePlan: (plan: WithId<FuturePlan>) => void;
  deleteFuturePlan: (id: string) => void;
  isLoading: boolean;
}

const SpendWiseContext = createContext<SpendWiseContextType | undefined>(undefined);

export function SpendWiseProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const expensesQuery = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'expenses') : null
  , [firestore, user]);
  const { data: expenses, isLoading: expensesLoading } = useCollection<Expense>(expensesQuery);

  const budgetsQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'budgets') : null
  , [firestore, user]);
  const { data: budgets, isLoading: budgetsLoading } = useCollection<Budget>(budgetsQuery);

  const futurePlansQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'futurePlans') : null
  , [firestore, user]);
  const { data: futurePlans, isLoading: futurePlansLoading } = useCollection<FuturePlan>(futurePlansQuery);

  const sortedExpenses = useMemo(() => expenses ? [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [], [expenses]);
  const sortedFuturePlans = useMemo(() => futurePlans ? [...futurePlans].sort((a,b) => new Date(b.targetDate).getTime() - new Date(a.targetDate).getTime()): [], [futurePlans]);

  const addExpense = (expense: Omit<Expense, 'id' | 'userId'>) => {
    if (!user || !expensesQuery) return;
    const newExpense = { ...expense, userId: user.uid };
    addDocumentNonBlocking(expensesQuery, newExpense);
  };

  const editExpense = (updatedExpense: WithId<Expense>) => {
    if (!user) return;
    const { id, ...expenseData } = updatedExpense;
    const docRef = doc(firestore, 'users', user.uid, 'expenses', id);
    setDocumentNonBlocking(docRef, expenseData, { merge: true });
  }

  const deleteExpense = (id: string) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'expenses', id);
    deleteDocumentNonBlocking(docRef);
  }

  const setBudgets = (newBudgets: Omit<Budget, 'userId'>[]) => {
    if (!user) return;
    const batch = writeBatch(firestore);
    newBudgets.forEach(budget => {
      // Use category as the ID for budgets to ensure one budget per category
      const docRef = doc(firestore, 'users', user.uid, 'budgets', budget.category);
      batch.set(docRef, { ...budget, userId: user.uid }, { merge: true });
    });
    batch.commit().catch(error => {
      console.error("Error writing batch for budgets: ", error);
      // Optionally, handle error with a toast or other notification
    });
  };
  
  const addFuturePlan = (plan: Omit<FuturePlan, 'id' | 'userId'>) => {
    if (!user || !futurePlansQuery) return;
    const newPlan = { ...plan, userId: user.uid };
    addDocumentNonBlocking(futurePlansQuery, newPlan);
  };
  
  const editFuturePlan = (updatedPlan: WithId<FuturePlan>) => {
    if (!user) return;
    const { id, ...planData } = updatedPlan;
    const docRef = doc(firestore, 'users', user.uid, 'futurePlans', id);
    setDocumentNonBlocking(docRef, planData, { merge: true });
  };
  
  const deleteFuturePlan = (id: string) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'futurePlans', id);
    deleteDocumentNonBlocking(docRef);
  };

  const getBudgetForCategory = (category: Category) => {
    return budgets?.find(b => b.category === category)?.amount || 0;
  };
  
  const getSpentForCategory = (category: Category) => {
    const now = new Date();
    return expenses
      ?.filter(e => {
        const expenseDate = new Date(e.date);
        return e.category === category && e.amount > 0 && expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0) || 0;
  };

  const isLoading = expensesLoading || budgetsLoading || futurePlansLoading;

  const value = {
    expenses: sortedExpenses,
    budgets: budgets || [],
    futurePlans: sortedFuturePlans,
    addExpense,
    editExpense,
    deleteExpense,
    setBudgets,
    getBudgetForCategory,
    getSpentForCategory,
    addFuturePlan,
    editFuturePlan,
    deleteFuturePlan,
    isLoading,
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
