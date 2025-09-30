'use server';

import { categorizeExpense } from '@/ai/flows/categorize-expense';
import type { CategorizeExpenseOutput } from '@/ai/flows/categorize-expense';
import { extractExpensesFromText } from '@/ai/flows/extract-expenses';
import type { ExtractExpensesOutput } from '@/ai/flows/extract-expenses';
import { addExpense as addExpenseFlow } from '@/ai/flows/add-expense-flow';
import type { AddExpenseInput } from '@/ai/flows/add-expense-flow';
import { extractBudgetsFromText } from '@/ai/flows/extract-budgets';
import type { ExtractBudgetsOutput } from '@/ai/flows/extract-budgets';


import { Category, type Expense, type Budget } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';

type SuggestionResult = {
  category: Category;
  confidence: number;
}

export async function getCategorySuggestion(description: string): Promise<{ data: SuggestionResult | null; error: string | null }> {
  if (!description?.trim()) {
    return { data: null, error: 'Description cannot be empty.' };
  }
  try {
    const result: CategorizeExpenseOutput = await categorizeExpense({ description });
    
    const isValidCategory = CATEGORIES.includes(result.category as Category);

    if (isValidCategory) {
      return { data: {
        category: result.category as Category,
        confidence: result.confidence
      }, error: null };
    } else {
      return { data: { category: 'Other', confidence: result.confidence }, error: `AI suggested an invalid category: "${result.category}". Defaulting to "Other".` };
    }
    
  } catch (e) {
    console.error(e);
    return { data: null, error: 'Failed to get category suggestion due to a server error.' };
  }
}

export async function getExpensesFromText(text: string): Promise<{ data: Omit<Expense, 'id' | 'userId'>[] | null; error: string | null }> {
    if (!text?.trim()) {
        return { data: null, error: 'Input text cannot be empty.' };
    }
    try {
        const result: ExtractExpensesOutput = await extractExpensesFromText({ text });
        
        const validExpenses = result.expenses.map(exp => ({
            ...exp,
            date: new Date(exp.date).toISOString(), // Ensure date is in ISO format
        }));

        return { data: validExpenses, error: null };

    } catch (e) {
        console.error(e);
        return { data: null, error: 'Failed to extract expenses due to a server error.' };
    }
}

export async function getBudgetsFromText(text: string): Promise<{ data: Omit<Budget, 'userId' | 'spent' | 'spendingHistory'>[] | null; error: string | null }> {
    if (!text?.trim()) {
        return { data: null, error: 'Input text cannot be empty.' };
    }
    try {
        const result: ExtractBudgetsOutput = await extractBudgetsFromText({ text });
        return { data: result.budgets, error: null };

    } catch (e) {
        console.error(e);
        return { data: null, error: 'Failed to extract budgets due to a server error.' };
    }
}

export async function addExpense(expenseData: AddExpenseInput): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await addExpenseFlow(expenseData);
    if (result.success) {
      return { success: true };
    }
    return { success: false, error: result.error };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Failed to add expense due to a server error.' };
  }
}


// This is a new action required for pdf-parse to work on the server
export async function parsePdf(fileBuffer: Buffer) {
  const pdf = (await import('pdf-parse')).default;
  const data = await pdf(fileBuffer);
  return data.text;
}
