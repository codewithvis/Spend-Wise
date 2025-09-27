'use client';

import { useState, useEffect } from 'react';
import { useSpendWise } from '@/contexts/spendwise-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CATEGORIES, CATEGORY_ICONS } from '@/lib/constants';
import type { Budget, Category } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Separator } from '../ui/separator';

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
        <CardDescription>
            Define your budget for each category and track your spending.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {CATEGORIES.filter(cat => cat !== 'Salary').map((category, index) => {
          const Icon = CATEGORY_ICONS[category];
          const budgetAmount = localBudgets[category] || 0;
          const spentAmount = getSpentForCategory(category);
          const progress = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

          return (
            <div key={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Column 1: Define Budget */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                             <Icon className="h-6 w-6 text-muted-foreground" />
                             <h3 className="text-lg font-semibold">{category}</h3>
                        </div>
                        <p className='text-sm text-muted-foreground'>1. Define the portion of the total amount for this section.</p>
                        <div className="flex-1 flex items-center gap-4 pt-2">
                           <Slider
                            value={[budgetAmount]}
                            onValueChange={(value) => handleBudgetChange(category, value[0])}
                            max={MAX_BUDGET}
                            step={100}
                            className="flex-1"
                           />
                           <div className="text-right min-w-[100px] font-mono">
                             {formatCurrency(budgetAmount)}
                           </div>
                        </div>
                    </div>
                    {/* Column 2: Manage Usage */}
                    <div className="space-y-3">
                        <h4 className="text-md font-semibold text-muted-foreground">Spending Status</h4>
                        <p className='text-sm text-muted-foreground'>2. Manage how much you have used.</p>
                         <div className="flex items-center gap-4 pt-2">
                            <Progress value={Math.min(progress, 100)} className="flex-1 h-3" />
                         </div>
                         <div className="text-sm text-muted-foreground min-w-[150px] text-right">
                           <span className='font-semibold text-foreground'>{formatCurrency(spentAmount)}</span> used of {formatCurrency(budgetAmount)}
                         </div>
                    </div>
                </div>
                {index < CATEGORIES.filter(c => c !== 'Salary').length - 1 && <Separator className="mt-8" />}
            </div>
          );
        })}
        <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSaveChanges}>Save All Budgets</Button>
        </div>
      </CardContent>
    </Card>
  );
}
