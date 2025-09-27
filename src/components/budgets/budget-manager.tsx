'use client';

import { useState, useEffect } from 'react';
import { useSpendWise } from '@/contexts/spendwise-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CATEGORIES, CATEGORY_ICONS } from '@/lib/constants';
import type { Budget, Category } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { WithId } from '@/firebase';

export function BudgetManager() {
  const { budgets, setBudgets, getSpentForCategory } = useSpendWise();
  const [localBudgets, setLocalBudgets] = useState<Partial<Record<Category, number>>>({});
  const { toast } = useToast();

  useEffect(() => {
    const initialBudgets = budgets.reduce((acc, budget) => {
      acc[budget.category] = budget.amount;
      return acc;
    }, {} as Partial<Record<Category, number>>);
    setLocalBudgets(initialBudgets);
  }, [budgets]);
  
  const handleBudgetChange = (category: Category, amount: string) => {
    const numericAmount = parseFloat(amount);
    setLocalBudgets(prev => ({
      ...prev,
      [category]: isNaN(numericAmount) ? 0 : numericAmount,
    }));
  };

  const handleSaveChanges = () => {
    const newBudgets: Omit<Budget, 'userId'>[] = Object.entries(localBudgets)
      .map(([category, amount]) => ({
        category: category as Category,
        amount: amount || 0,
      }))
      .filter(b => b.amount > 0);
      
    setBudgets(newBudgets);
    toast({
        title: "Budgets Updated",
        description: "Your new budget goals have been saved.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Budgets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {CATEGORIES.filter(cat => cat !== 'Salary').map((category) => {
          const Icon = CATEGORY_ICONS[category];
          const budgetAmount = localBudgets[category] || 0;
          const spentAmount = getSpentForCategory(category);
          const progress = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-4">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium flex-1">{category}</span>
                <div className="w-32">
                   <Input
                    type="number"
                    placeholder="0.00"
                    value={budgetAmount || ''}
                    onChange={(e) => handleBudgetChange(category, e.target.value)}
                    className="text-right"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 pl-9">
                  <Progress value={Math.min(progress, 100)} className="flex-1 h-2" />
                  <div className="text-xs text-muted-foreground w-32 text-right">
                    {formatCurrency(spentAmount)} / {formatCurrency(budgetAmount)}
                  </div>
              </div>
            </div>
          );
        })}
        <div className="flex justify-end pt-4">
            <Button onClick={handleSaveChanges}>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
