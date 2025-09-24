'use client';

import { AddExpenseButton } from '@/components/expenses/add-expense-button';
import { ExpensesDataTable } from '@/components/expenses/expenses-data-table';
import { Button } from '@/components/ui/button';
import { useSpendWise } from '@/contexts/spendwise-context';
import { FileDown } from 'lucide-react';

const handleExport = (expenses) => {
  const headers = ['Date', 'Description', 'Category', 'Amount'];
  const csvRows = [headers.join(',')];
  
  expenses.forEach(expense => {
    const row = [
      new Date(expense.date).toLocaleDateString(),
      `"${expense.description.replace(/"/g, '""')}"`,
      expense.category,
      expense.amount,
    ].join(',');
    csvRows.push(row);
  });
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', 'spendwise_expenses.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};


export default function ExpensesPage() {
  const { expenses } = useSpendWise();
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => handleExport(expenses)}>
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <AddExpenseButton />
        </div>
      </div>
       <ExpensesDataTable />
    </div>
  );
}
