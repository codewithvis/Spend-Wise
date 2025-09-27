'use client';

import { AddExpenseButton } from '@/components/expenses/add-expense-button';
import { ExpensesDataTable } from '@/components/expenses/expenses-data-table';
import { Button } from '@/components/ui/button';
import { useSpendWise } from '@/contexts/spendwise-context';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from '@/lib/utils';


const handleExport = (expenses) => {
  const doc = new jsPDF();
  doc.text("SpendWise Expenses", 14, 16);

  const tableColumn = ["Date", "Description", "Category", "Amount"];
  const tableRows = [];

  expenses.forEach(expense => {
    const expenseData = [
      new Date(expense.date).toLocaleDateString(),
      expense.description,
      expense.category,
      formatCurrency(expense.amount),
    ];
    tableRows.push(expenseData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    headStyles: { fillColor: [22, 163, 74] }, // Example color: green
  });

  doc.save('spendwise_expenses.pdf');
};


export default function ExpensesPage() {
  const { expenses } = useSpendWise();
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 md:space-x-2">
        <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => handleExport(expenses)}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <AddExpenseButton />
        </div>
      </div>
       <ExpensesDataTable />
    </div>
  );
}
