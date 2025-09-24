'use client';

import { useSpendWise } from '@/contexts/spendwise-context';
import { formatCurrency } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CATEGORY_ICONS } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';

export function RecentExpenses() {
  const { expenses } = useSpendWise();

  const recentExpenses = expenses.slice(0, 5);
  
  if (recentExpenses.length === 0) {
    return <div className="text-sm text-muted-foreground">You have no recorded expenses.</div>;
  }

  return (
    <div className="space-y-6">
      {recentExpenses.map((expense) => {
        const Icon = CATEGORY_ICONS[expense.category];
        const isIncome = expense.category === 'Salary';
        return (
          <div key={expense.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-secondary">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{expense.description}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(expense.date), { addSuffix: true })}
              </p>
            </div>
            <div className={`ml-auto font-medium ${isIncome ? 'text-green-500' : ''}`}>
              {isIncome ? `+${formatCurrency(Math.abs(expense.amount))}` : formatCurrency(expense.amount)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
