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
import { PlanForm } from './plan-form';

export function AddPlanButton({ variant = 'outline', ...props }: ButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button variant={variant} onClick={() => setIsOpen(true)} {...props}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Plan
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Future Plan</DialogTitle>
          <DialogDescription>
            Enter the details of your planned expenditure.
          </DialogDescription>
        </DialogHeader>
        <PlanForm onFinished={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
