'use client';

import { AddExpenseButton } from '@/components/expenses/add-expense-button';
import { ExpensesDataTable } from '@/components/expenses/expenses-data-table';
import { Button } from '@/components/ui/button';
import { useSpendWise } from '@/contexts/spendwise-context';
import { FileDown, ArrowUpCircle, ArrowDownCircle, Scale } from 'lucide-react';
import type { Expense } from '@/lib/types';
import { WithId } from '@/firebase';
import { ImportExpensesButton } from '@/components/expenses/import-expenses-button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

const handleExport = async (expenses: WithId<Expense>[]) => {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  
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
  
  autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] },
  });

  doc.save('spendwise_expenses_report.pdf');
};

export function ExpensesClient() {
  const { expenses } = useSpendWise();

  const totalIncome = expenses
    .filter(e => e.category === 'Salary')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = expenses
    .filter(e => e.category !== 'Salary')
    .reduce((sum, e) => sum + e.amount, 0);

  const netBalance = totalIncome - totalExpenses;


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

       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <ArrowUpCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-500">{formatCurrency(totalIncome)}</div>
                <p className="text-xs text-muted-foreground">from all sources</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <ArrowDownCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</div>
                <p className="text-xs text-muted-foreground">across all categories</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {formatCurrency(netBalance)}
                </div>
                <p className="text-xs text-muted-foreground">Income minus expenses</p>
            </CardContent>
        </Card>
      </div>

       <ExpensesDataTable />
    </div>
  );
}
