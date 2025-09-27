'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ExpenseForm } from './expense-form';
import type { Expense } from '@/lib/types';
import { WithId } from '@/firebase';

interface EditExpenseDialogProps {
  expense: WithId<Expense>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditExpenseDialog({ expense, isOpen, onOpenChange }: EditExpenseDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Update the details of your expense. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm onFinished={() => onOpenChange(false)} expense={expense} />
      </DialogContent>
    </Dialog>
  );
}
