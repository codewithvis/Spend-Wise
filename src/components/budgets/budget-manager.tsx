
'use client';

import { useState, useEffect } from 'react';
import { useSpendWise } from '@/contexts/spendwise-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CATEGORIES, CATEGORY_ICONS } from '@/lib/constants';
import type { Budget, Category, SpendingEntry } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Separator } from '../ui/separator';
import { PlusCircle, Trash2, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

type LocalBudget = { amount: number; spendingHistory: SpendingEntry[] };
type LocalBudgets = Partial<Record<Category, LocalBudget>>;

export function BudgetManager() {
  const { budgets, updateBudget } = useSpendWise();
  const [localBudgets, setLocalBudgets] = useState<LocalBudgets>({});
  const [newEntryAmount, setNewEntryAmount] = useState<string>('');
  const [newEntryDate, setNewEntryDate] = useState<Date>(new Date());
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initialBudgets = CATEGORIES.reduce((acc, category) => {
        if (category === 'Salary') return acc;
        
        const budget = budgets.find(b => b.category === category);
        
        acc[category] = {
            amount: budget?.amount || 0,
            spendingHistory: budget?.spendingHistory || [],
        };
        return acc;
    }, {} as LocalBudgets);

    setLocalBudgets(initialBudgets);
  }, [budgets]);
  
  const handleBudgetAmountChange = (category: Category, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    if (isNaN(numericValue)) return;
    
    setLocalBudgets(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || { amount: 0, spendingHistory: [] }),
        amount: numericValue,
      },
    }));
  };

  const handleAddSpendingEntry = (category: Category) => {
    const amount = parseFloat(newEntryAmount);
    if (isNaN(amount) || amount <= 0) {
        toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a positive number.' });
        return;
    }
    
    const newEntry: SpendingEntry = {
        id: new Date().getTime().toString(),
        amount,
        date: newEntryDate.toISOString(),
    };

    const currentHistory = localBudgets[category]?.spendingHistory || [];
    const updatedHistory = [...currentHistory, newEntry];

    setLocalBudgets(prev => ({
        ...prev,
        [category]: {
            ...(prev[category] || { amount: 0, spendingHistory: [] }),
            spendingHistory: updatedHistory,
        },
    }));
    
    // Reset form
    setNewEntryAmount('');
    setNewEntryDate(new Date());
    setActiveCategory(null);
  };
  
  const handleDeleteSpendingEntry = (category: Category, entryId: string) => {
      const currentHistory = localBudgets[category]?.spendingHistory || [];
      const updatedHistory = currentHistory.filter(entry => entry.id !== entryId);
      
      setLocalBudgets(prev => ({
        ...prev,
        [category]: {
          ...(prev[category]!),
          spendingHistory: updatedHistory,
        },
      }));
  };

  const handleSaveChanges = (category: Category) => {
    const localBudget = localBudgets[category];
    if (!localBudget) return;

    const budgetToSave: Omit<Budget, 'userId'> = {
        category,
        amount: localBudget.amount,
        spendingHistory: localBudget.spendingHistory,
    };
      
    updateBudget(budgetToSave);
    toast({
        title: "Budget Updated",
        description: `Your budget for ${category} has been saved.`,
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
            Define your budget for each category and log your spending.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {CATEGORIES.filter(cat => cat !== 'Salary').map((category, index) => {
          const Icon = CATEGORY_ICONS[category];
          const localBudget = localBudgets[category];
          const budgetAmount = localBudget?.amount || 0;
          const spentAmount = localBudget?.spendingHistory.reduce((sum, entry) => sum + entry.amount, 0) || 0;
          const remainingAmount = budgetAmount - spentAmount;
          const isAddingEntry = activeCategory === category;

          return (
            <div key={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Column 1: Define Budget */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                             <Icon className="h-6 w-6 text-muted-foreground" />
                             <h3 className="text-lg font-semibold">{category}</h3>
                        </div>
                        <p className='text-sm text-muted-foreground'>1. Define the total budget for this category.</p>
                        <div className="flex-1 flex items-center gap-4 pt-2">
                           <Input
                            type="number"
                            value={getInputValue(budgetAmount)}
                            onChange={(e) => handleBudgetAmountChange(category, e.target.value)}
                            placeholder="Enter budget amount"
                            className="flex-1"
                           />
                           <div className="text-right min-w-[100px] font-mono">
                             {formatCurrency(budgetAmount)}
                           </div>
                        </div>
                    </div>
                    {/* Column 2: Spending Status & Log */}
                    <div className="space-y-3">
                        <h4 className="text-md font-semibold text-muted-foreground">Spending Status</h4>
                        <p className='text-sm text-muted-foreground'>2. Track your spending and see your remaining balance.</p>
                        <div className='flex justify-between items-center pt-2'>
                          <div className='text-sm'>
                            Spent: <span className='font-bold'>{formatCurrency(spentAmount)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Remaining: <span className={`font-semibold ${remainingAmount < 0 ? 'text-destructive' : 'text-foreground'}`}>{formatCurrency(remainingAmount)}</span>
                          </div>
                        </div>
                         <div className="border rounded-md p-3 mt-4 bg-muted/20">
                            <h5 className='font-semibold text-sm mb-2'>Spending Log</h5>
                            <div className='space-y-2 max-h-32 overflow-y-auto pr-2'>
                                {localBudget?.spendingHistory && localBudget.spendingHistory.length > 0 ? (
                                    [...localBudget.spendingHistory].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                                        <div key={entry.id} className='flex justify-between items-center text-sm bg-background p-2 rounded-md'>
                                            <div>
                                                <p className='font-medium'>{formatCurrency(entry.amount)}</p>
                                                <p className='text-xs text-muted-foreground'>{format(new Date(entry.date), 'PP')} ({formatDistanceToNow(new Date(entry.date), { addSuffix: true })})</p>
                                            </div>
                                            <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => handleDeleteSpendingEntry(category, entry.id)}>
                                                <Trash2 className='h-4 w-4 text-destructive'/>
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className='text-xs text-muted-foreground italic'>No spending entries logged.</p>
                                )}
                            </div>
                            {isAddingEntry ? (
                                <div className='mt-3 border-t pt-3 space-y-2'>
                                     <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Amount"
                                            value={newEntryAmount}
                                            onChange={e => setNewEntryAmount(e.target.value)}
                                            className="h-9"
                                        />
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant='outline' size='icon' className='h-9 w-9'>
                                                    <CalendarIcon className='h-4 w-4'/>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                mode="single"
                                                selected={newEntryDate}
                                                onSelect={(d) => d && setNewEntryDate(d)}
                                                initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className='flex gap-2 justify-end'>
                                        <Button variant='ghost' size='sm' onClick={() => setActiveCategory(null)}>Cancel</Button>
                                        <Button size='sm' onClick={() => handleAddSpendingEntry(category)}>Add</Button>
                                    </div>
                                </div>
                            ) : (
                                <Button variant='outline' size='sm' className='mt-3 w-full' onClick={() => setActiveCategory(category)}>
                                    <PlusCircle className='mr-2 h-4 w-4'/> Add Spending Entry
                                </Button>
                            )}
                         </div>
                    </div>
                </div>
                <div className="flex justify-end pt-4 mt-4">
                  <Button onClick={() => handleSaveChanges(category)}>Save Changes for {category}</Button>
                </div>
                {index < CATEGORIES.filter(c => c !== 'Salary').length - 1 && <Separator className="mt-8" />}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
