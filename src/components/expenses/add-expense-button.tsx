
'use client';

import { useState } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { ExpenseForm } from './expense-form';

export function AddExpenseButton({ variant = 'default', ...props }: ButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button variant={variant} onClick={() => setIsOpen(true)} {...props}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Expense
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Enter the details of your expense.
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm onFinished={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
