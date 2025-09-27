'use client';

import { OverviewCards } from '@/components/dashboard/overview-cards';
import { RecentExpenses } from '@/components/dashboard/recent-expenses';
import { SpendingPieChart } from '@/components/dashboard/spending-pie-chart';
import { AddExpenseButton } from '@/components/expenses/add-expense-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSpendWise } from '@/contexts/spendwise-context';

export default function Dashboard() {
  const { expenses } = useSpendWise();
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 md:space-x-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <AddExpenseButton />
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed shadow-sm h-[60vh]">
          <div className="text-center p-4">
            <h3 className="text-2xl font-bold tracking-tight">No expenses yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add your first expense to see your dashboard.</p>
            <AddExpenseButton variant="default" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <OverviewCards />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-12 lg:col-span-4">
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <SpendingPieChart />
              </CardContent>
            </Card>
            <Card className="col-span-12 lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentExpenses />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
