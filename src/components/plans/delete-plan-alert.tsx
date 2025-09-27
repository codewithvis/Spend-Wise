'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSpendWise } from '@/contexts/spendwise-context';
import { useToast } from '@/hooks/use-toast';

interface DeletePlanAlertProps {
  planId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePlanAlert({ planId, isOpen, onOpenChange }: DeletePlanAlertProps) {
  const { deleteFuturePlan } = useSpendWise();
  const { toast } = useToast();

  const handleDelete = () => {
    deleteFuturePlan(planId);
    toast({
      title: 'Plan Deleted',
      description: 'The future plan has been removed.',
    });
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this future plan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
