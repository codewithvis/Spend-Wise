'use client';

import { useState, useEffect } from 'react';
import { useSpendWise } from '@/contexts/spendwise-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CATEGORIES, CATEGORY_ICONS } from '@/lib/constants';
import type { Budget, Category } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';

const MAX_BUDGET = 50000; // Define a max for the slider

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
  
  const handleBudgetChange = (category: Category, amount: number) => {
    setLocalBudgets(prev => ({
      ...prev,
      [category]: amount,
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
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{category}</span>
                </div>
                <div className="flex-1 flex items-center gap-4">
                   <Slider
                    value={[budgetAmount]}
                    onValueChange={(value) => handleBudgetChange(category, value[0])}
                    max={MAX_BUDGET}
                    step={100}
                    className="flex-1"
                   />
                   <div className="text-right min-w-[100px] font-mono text-sm">
                     {formatCurrency(budgetAmount)}
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-4 pl-7">
                  <Progress value={Math.min(progress, 100)} className="flex-1 h-2" />
                  <div className="text-xs text-muted-foreground min-w-[150px] text-right">
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
