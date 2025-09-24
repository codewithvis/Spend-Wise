'use server';

import { categorizeExpense } from '@/ai/flows/categorize-expense';
import type { CategorizeExpenseOutput } from '@/ai/flows/categorize-expense';
import { Category } from '@/lib/types';
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
    
    // Validate if the returned category is one of the allowed ones.
    const isValidCategory = CATEGORIES.includes(result.category as Category);

    if (isValidCategory) {
      return { data: {
        category: result.category as Category,
        confidence: result.confidence
      }, error: null };
    } else {
      // If the AI returns an invalid category, default to 'Other'
      return { data: { category: 'Other', confidence: result.confidence }, error: `AI suggested an invalid category: "${result.category}". Defaulting to "Other".` };
    }
    
  } catch (e) {
    console.error(e);
    return { data: null, error: 'Failed to get category suggestion due to a server error.' };
  }
}
