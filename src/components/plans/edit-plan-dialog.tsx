'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PlanForm } from './plan-form';
import type { FuturePlan } from '@/lib/types';
import { WithId } from '@/firebase';

interface EditPlanDialogProps {
  plan: WithId<FuturePlan>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPlanDialog({ plan, isOpen, onOpenChange }: EditPlanDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Future Plan</DialogTitle>
          <DialogDescription>
            Update the details of your planned expenditure.
          </DialogDescription>
        </DialogHeader>
        <PlanForm onFinished={() => onOpenChange(false)} plan={plan} />
      </DialogContent>
    </Dialog>
  );
}
