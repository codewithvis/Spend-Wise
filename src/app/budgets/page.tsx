import { BudgetManager } from '@/components/budgets/budget-manager';

export default function BudgetsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 md:space-x-2">
        <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
      </div>
      <p className="text-muted-foreground">
        Set your monthly spending goals for each category.
      </p>
      <BudgetManager />
    </div>
  );
}
