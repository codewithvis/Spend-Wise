'use client';

import { BudgetManager } from '@/components/budgets/budget-manager';
import { Button } from '@/components/ui/button';
import { useSpendWise } from '@/contexts/spendwise-context';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from '@/lib/utils';


const handleExport = (budgets) => {
  const doc = new jsPDF();
  doc.text("SpendWise Budgets", 14, 16);

  const tableColumn = ["Category", "Budgeted Amount", "Amount Spent", "Remaining"];
  const tableRows = [];

  budgets.forEach(budget => {
    const remaining = budget.amount - (budget.spent || 0);
    const budgetData = [
      budget.category,
      formatCurrency(budget.amount),
      formatCurrency(budget.spent || 0),
      formatCurrency(remaining)
    ];
    tableRows.push(budgetData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    headStyles: { fillColor: [22, 163, 74] },
  });

  doc.save('spendwise_budgets.pdf');
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
