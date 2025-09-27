'use server';

/**
 * @fileOverview AI-powered expense extraction from unstructured text.
 * - extractExpensesFromText - An async function that extracts expenses from a block of text.
 * - ExtractExpensesInput - The input type for the extractExpensesFromText function.
 * - ExtractExpensesOutput - The output type for the extractExpensesFromText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { CATEGORIES } from '@/lib/constants';

const ExtractExpensesInputSchema = z.object({
  text: z.string().describe('A block of text that may contain expense records.'),
});
export type ExtractExpensesInput = z.infer<typeof ExtractExpensesInputSchema>;

const ExtractedExpenseSchema = z.object({
    date: z.string().describe("The date of the expense in YYYY-MM-DD format."),
    description: z.string().describe("The description of the expense."),
    amount: z.number().describe("The numeric amount of the expense."),
    category: z.enum(CATEGORIES).describe("The category of the expense."),
});

const ExtractExpensesOutputSchema = z.object({
  expenses: z.array(ExtractedExpenseSchema).describe('An array of extracted expense objects.'),
});
export type ExtractExpensesOutput = z.infer<typeof ExtractExpensesOutputSchema>;

export async function extractExpensesFromText(input: ExtractExpensesInput): Promise<ExtractExpensesOutput> {
  return extractExpensesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractExpensesPrompt',
  input: {schema: ExtractExpensesInputSchema},
  output: {schema: ExtractExpensesOutputSchema},
  prompt: `You are an expert at parsing and extracting expense data from unstructured text.
  Given the following text, identify all individual expense records. For each record, extract the date, description, amount, and category.
  The current date is ${new Date().toDateString()}. If a year is not specified, assume the current year.

  Rules:
  - The category MUST be one of the following: ${CATEGORIES.join(', ')}.
  - If a category from the text does not match one of these, map it to the closest valid category or use 'Other'.
  - Dates can be in various formats (e.g., 'yesterday', 'last Tuesday', 'Mar 15', '2024-03-15'). Convert them to 'YYYY-MM-DD' format.
  - The amount should be a number, ignore currency symbols.
  - Return an empty array if no expenses are found.

  Text to parse:
  {{{text}}}
  `,
});

const extractExpensesFlow = ai.defineFlow(
  {
    name: 'extractExpensesFlow',
    inputSchema: ExtractExpensesInputSchema,
    outputSchema: ExtractExpensesOutputSchema,
  },
  async input => {
    if (!input.text.trim()) {
        return { expenses: [] };
    }
    const {output} = await prompt(input);
    return output || { expenses: [] };
  }
);
