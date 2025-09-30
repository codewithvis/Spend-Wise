import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-expense.ts';
import '@/ai/flows/extract-expenses.ts';
import '@/ai/flows/add-expense-flow.ts';
import '@/ai/flows/extract-budgets.ts';
