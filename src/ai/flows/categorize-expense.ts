'use server';

/**
 * @fileOverview AI-powered expense categorization flow.
 *
 * This file defines a Genkit flow that uses AI to automatically categorize
 * expenses based on their description.
 *
 * @fileOverview AI-powered expense categorization flow.
 * - categorizeExpense - An async function that categorizes an expense.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The output type for the categorizeExpense function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeExpenseInputSchema = z.object({
  description: z.string().describe('The description of the expense.'),
});
export type CategorizeExpenseInput = z.infer<typeof CategorizeExpenseInputSchema>;

const CategorizeExpenseOutputSchema = z.object({
  category: z.string().describe('The predicted category of the expense.'),
  confidence: z.number().describe('The confidence level of the prediction (0-1).'),
});
export type CategorizeExpenseOutput = z.infer<typeof CategorizeExpenseOutputSchema>;

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  return categorizeExpenseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeExpensePrompt',
  input: {schema: CategorizeExpenseInputSchema},
  output: {schema: CategorizeExpenseOutputSchema},
  prompt: `You are an expert expense categorizer. Given the description of an expense, you will determine the most appropriate category for it.
  You will also provide a confidence level for your prediction, between 0 and 1.

  Expense description: {{{description}}}

  Respond with a JSON object with the category and confidence fields.  The category MUST be one of the following:
  - Groceries
  - Dining
  - Transportation
  - Entertainment
  - Utilities
  - Rent
  - Salary
  - Shopping
  - Travel
  - Other`,
});

const categorizeExpenseFlow = ai.defineFlow(
  {
    name: 'categorizeExpenseFlow',
    inputSchema: CategorizeExpenseInputSchema,
    outputSchema: CategorizeExpenseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
