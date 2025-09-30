'use server';

/**
 * @fileOverview AI-powered budget extraction from unstructured text.
 * - extractBudgetsFromText - An async function that extracts budgets from a block of text.
 * - ExtractBudgetsInput - The input type for the extractBudgetsFromText function.
 * - ExtractBudgetsOutput - The output type for the extractBudgetsFromText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { CATEGORIES } from '@/lib/constants';

const ExtractBudgetsInputSchema = z.object({
  text: z.string().describe('A block of text that may contain budget information.'),
});
export type ExtractBudgetsInput = z.infer<typeof ExtractBudgetsInputSchema>;

const ExtractedBudgetSchema = z.object({
    amount: z.number().describe("The numeric amount of the budget."),
    category: z.enum(CATEGORIES).describe("The category of the budget."),
});

const ExtractBudgetsOutputSchema = z.object({
  budgets: z.array(ExtractedBudgetSchema).describe('An array of extracted budget objects.'),
});
export type ExtractBudgetsOutput = z.infer<typeof ExtractBudgetsOutputSchema>;

export async function extractBudgetsFromText(input: ExtractBudgetsInput): Promise<ExtractBudgetsOutput> {
  return extractBudgetsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractBudgetsPrompt',
  input: {schema: ExtractBudgetsInputSchema},
  output: {schema: ExtractBudgetsOutputSchema},
  prompt: `You are an expert at parsing and extracting budget data from unstructured text.
  Given the following text, identify all individual budget allocations. For each record, extract the amount and category.

  Rules:
  - The category MUST be one of the following: ${CATEGORIES.join(', ')}.
  - The 'Salary' category should be ignored.
  - If a category from the text does not match one of these, map it to the closest valid category or use 'Other'.
  - The amount should be a number, ignore currency symbols.
  - Return an empty array if no budgets are found.

  Text to parse:
  {{{text}}}
  `,
});

const extractBudgetsFlow = ai.defineFlow(
  {
    name: 'extractBudgetsFlow',
    inputSchema: ExtractBudgetsInputSchema,
    outputSchema: ExtractBudgetsOutputSchema,
  },
  async input => {
    if (!input.text.trim()) {
        return { budgets: [] };
    }
    const {output} = await prompt(input);
    return output || { budgets: [] };
  }
);
