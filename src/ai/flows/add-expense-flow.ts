'use server';

/**
 * @fileOverview A Genkit flow for adding an expense to Firestore.
 *
 * - addExpenseFlow - A function that handles the expense creation process.
 * - AddExpenseInput - The input type for the addExpenseFlow function.
 * - AddExpenseOutput - The return type for the addExpenseFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

const AddExpenseInputSchema = z.object({
  userId: z.string().describe('The ID of the user adding the expense.'),
  description: z.string().describe('The description of the expense.'),
  amount: z.number().describe('The amount of the expense.'),
  category: z.string().describe('The category of the expense.'),
  date: z.string().describe('The date of the expense as an ISO string.'),
});
export type AddExpenseInput = z.infer<typeof AddExpenseInputSchema>;

const AddExpenseOutputSchema = z.object({
  success: z.boolean(),
  expenseId: z.string().optional(),
  error: z.string().optional(),
});
export type AddExpenseOutput = z.infer<typeof AddExpenseOutputSchema>;


if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();


export async function addExpense(input: AddExpenseInput): Promise<AddExpenseOutput> {
  return addExpenseFlow(input);
}

const addExpenseFlow = ai.defineFlow(
  {
    name: 'addExpenseFlow',
    inputSchema: AddExpenseInputSchema,
    outputSchema: AddExpenseOutputSchema,
  },
  async (input) => {
    try {
      const { userId, ...expenseData } = input;
      const docRef = await db.collection('users').doc(userId).collection('expenses').add(expenseData);
      return { success: true, expenseId: docRef.id };
    } catch (error) {
      console.error('Error adding expense to Firestore:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return { success: false, error: errorMessage };
    }
  }
);
