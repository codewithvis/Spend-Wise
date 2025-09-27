'use client';

import { AddPlanButton } from '@/components/plans/add-plan-button';
import { PlansDataTable } from '@/components/plans/plans-data-table';

export default function PlansPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Future Plans</h2>
        <div className="flex items-center space-x-2">
          <AddPlanButton />
        </div>
      </div>
      <p className="text-muted-foreground">
        Plan your future expenses and save for your goals.
      </p>
       <PlansDataTable />
    </div>
  );
}
