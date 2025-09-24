'use client';

import { useSpendWise } from '@/contexts/spendwise-context';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, PiggyBank, Scale, TrendingDown } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

export function OverviewCards() {
  const { expenses, budgets } = useSpendWise();
  const now = new Date();

  const currentMonthExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
  });

  const totalSpent = currentMonthExpenses
    .filter(e => e.category !== 'Salary')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalBudget = budgets
    .filter(b => b.category !== 'Salary')
    .reduce((sum, b) => sum + b.amount, 0);
    
  const remainingBudget = totalBudget - totalSpent;
  
  const spendByCategory = CATEGORIES.reduce((acc, category) => {
    if (category === 'Salary') return acc;
    acc[category] = currentMonthExpenses
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(spendByCategory).sort((a, b) => b[1] - a[1])[0];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent (This Month)</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          <p className="text-xs text-muted-foreground">in {now.toLocaleString('default', { month: 'long' })}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
           <p className="text-xs text-muted-foreground">across all categories</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-destructive' : 'text-primary'}`}>
            {formatCurrency(remainingBudget)}
          </div>
          <p className="text-xs text-muted-foreground">
            {remainingBudget < 0 ? `${formatCurrency(Math.abs(remainingBudget))} over budget` : 'left to spend'}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Spending Category</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topCategory?.[0] || 'N/A'}</div>
          <p className="text-xs text-muted-foreground">{formatCurrency(topCategory?.[1] || 0)} spent</p>
        </CardContent>
      </Card>
    </>
  );
}
