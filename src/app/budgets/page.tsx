'use client';

import { BudgetManager } from '@/components/budgets/budget-manager';
import { Button } from '@/components/ui/button';
import { useSpendWise } from '@/contexts/spendwise-context';
import { FileDown } from 'lucide-react';

const handleExport = (budgets) => {
  const headers = ['Category', 'Budgeted Amount', 'Amount Spent'];
  const csvRows = [headers.join(',')];

  budgets.forEach((budget) => {
    const row = [
      budget.category,
      budget.amount,
      budget.spent || 0,
    ].join(',');
    csvRows.push(row);
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', 'spendwise_budgets.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export default function BudgetsPage() {
  const { budgets } = useSpendWise();
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 md:space-x-2">
        <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => handleExport(budgets)}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground">
        Set your monthly spending goals for each category.
      </p>
      <BudgetManager />
    </div>
  );
}