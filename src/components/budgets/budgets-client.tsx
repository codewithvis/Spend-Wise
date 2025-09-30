
'use client';

import { Button } from '@/components/ui/button';
import { useSpendWise } from '@/contexts/spendwise-context';
import { FileDown } from 'lucide-react';
import type { Budget, Expense } from '@/lib/types';
import { WithId } from '@/firebase';
import { formatCurrency } from '@/lib/utils';
import { BudgetManager } from '@/components/budgets/budget-manager';
import { ImportBudgetsButton } from './import-budgets-button';

const handleExport = async (budgets: WithId<Budget>[], expenses: WithId<Expense>[]) => {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();
  doc.text("SpendWise Budgets Report", 14, 16);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

  let startY = 30;

  budgets.forEach(budget => {
    if (startY > 250) { // Add new page if content gets too long
        doc.addPage();
        startY = 20;
    }
    
    const remaining = budget.amount - (budget.spent || 0);

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Category: ${budget.category}`, 14, startY);
    startY += 8;

    const summaryColumn = ["Budgeted", "Spent", "Remaining"];
    const summaryRow = [
        formatCurrency(budget.amount),
        formatCurrency(budget.spent || 0),
        formatCurrency(remaining)
    ];

    autoTable(doc, {
        head: [summaryColumn],
        body: [summaryRow],
        startY: startY,
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] },
    });
    
    startY = (doc as any).lastAutoTable.finalY + 10;

    const categoryExpenses = expenses.filter(e => e.category === budget.category);

    if (categoryExpenses.length > 0) {
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text("Breakdown of expenses for this category:", 14, startY);
        startY += 6;
        
        const expenseTableColumn = ["Date", "Description", "Amount"];
        const expenseTableRows = categoryExpenses.map(expense => [
            new Date(expense.date).toLocaleDateString(),
            expense.description,
            formatCurrency(expense.amount)
        ]);
        
        autoTable(doc, {
            head: [expenseTableColumn],
            body: expenseTableRows,
            startY: startY,
            theme: 'grid',
        });
        startY = (doc as any).lastAutoTable.finalY + 15;
    } else {
        doc.setFontSize(10);
        doc.setFont(undefined, 'italic');
        doc.text("No expenses recorded for this category.", 14, startY);
        startY += 15;
    }
  });


  doc.save('spendwise_budgets_report.pdf');
};

export function BudgetsClient() {
  const { budgets, expenses } = useSpendWise();
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 md:space-x-2">
        <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
        <div className="flex items-center space-x-2">
          <ImportBudgetsButton />
          <Button variant="outline" onClick={() => handleExport(budgets, expenses)}>
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
