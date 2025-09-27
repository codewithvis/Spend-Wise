
'use client';

import { AddExpenseButton } from '@/components/expenses/add-expense-button';
import { ExpensesDataTable } from '@/components/expenses/expenses-data-table';
import { Button } from '@/components/ui/button';
import { useSpendWise } from '@/contexts/spendwise-context';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from '@/lib/utils';
import type { Expense } from '@/lib/types';
import { WithId } from '@/firebase';
import { ImportExpensesButton } from '@/components/expenses/import-expenses-button';

const handleExport = (expenses: WithId<Expense>[]) => {
  const doc = new jsPDF();
  doc.text("SpendWise Expenses Report", 14, 16);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

  const tableColumn = ["Date", "Description", "Category", "Amount"];
  const tableRows = expenses.map(expense => [
      new Date(expense.date).toLocaleDateString(),
      expense.description,
      expense.category,
      formatCurrency(expense.amount)
  ]);
  
  doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] },
  });

  doc.save('spendwise_expenses_report.pdf');
};


export default function ExpensesPage() {
  const { expenses } = useSpendWise();
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 md:space-x-2">
        <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
        <div className="flex items-center space-x-2">
           <ImportExpensesButton />
           <Button variant="outline" onClick={() => handleExport(expenses)}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <AddExpenseButton />
        </div>
      </div>
      <p className="text-muted-foreground">
        Keep track of all your expenses in one place.
      </p>
       <ExpensesDataTable />
    </div>
  );
}
