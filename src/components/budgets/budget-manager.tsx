
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
import { Input } from '@/components/ui/input';
import { Separator } from '../ui/separator';

type LocalBudgetValues = { amount: number; spent: number };
type LocalBudgets = Partial<Record<Category, LocalBudgetValues>>;

export function BudgetManager() {
  const { budgets, setBudgets, getSpentForCategory } = useSpendWise();
  const [localBudgets, setLocalBudgets] = useState<LocalBudgets>({});
  const { toast } = useToast();

  useEffect(() => {
    const initialBudgets = CATEGORIES.reduce((acc, category) => {
        if (category === 'Salary') return acc;
        
        const budget = budgets.find(b => b.category === category);
        const autoSpent = getSpentForCategory(category);

        acc[category] = {
            amount: budget?.amount || 0,
            spent: budget?.spent ?? autoSpent,
        };
        return acc;
    }, {} as LocalBudgets);

    setLocalBudgets(initialBudgets);
  }, [budgets, getSpentForCategory]);
  
  const handleBudgetChange = (category: Category, field: keyof LocalBudgetValues, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    if (isNaN(numericValue)) return;
    
    setLocalBudgets(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || { amount: 0, spent: 0 }),
        [field]: numericValue,
      },
    }));
  };

  const handleSaveChanges = () => {
    const newBudgets: Omit<Budget, 'userId'>[] = Object.entries(localBudgets)
      .map(([category, values]) => ({
        category: category as Category,
        amount: values.amount || 0,
        spent: values.spent || 0,
      }));
      
    setBudgets(newBudgets);
    toast({
        title: "Budgets Updated",
        description: "Your new budget goals have been saved.",
    });
  };

  const getInputValue = (value: number) => {
    return value === 0 ? '' : String(value);
  }

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
          const budgetAmount = localBudgets[category]?.amount || 0;
          const spentAmount = localBudgets[category]?.spent || 0;
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
                           <Input
                            type="number"
                            value={getInputValue(budgetAmount)}
                            onChange={(e) => handleBudgetChange(category, 'amount', e.target.value)}
                            placeholder="Enter budget amount"
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
                         <div className="flex-1 flex items-center gap-4 pt-2">
                            <Input
                                type="number"
                                value={getInputValue(spentAmount)}
                                onChange={(e) => handleBudgetChange(category, 'spent', e.target.value)}
                                placeholder="Enter amount spent"
                                className="flex-1"
                            />
                            <div className="text-right min-w-[100px] font-mono">
                                {formatCurrency(spentAmount)}
                            </div>
                         </div>
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
