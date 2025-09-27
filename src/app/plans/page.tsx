
'use client';

import { AddPlanButton } from '@/components/plans/add-plan-button';
import { PlansDataTable } from '@/components/plans/plans-data-table';
import { Button } from '@/components/ui/button';
import { useSpendWise } from '@/contexts/spendwise-context';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from '@/lib/utils';
import type { FuturePlan } from '@/lib/types';
import { WithId } from '@/firebase';
import { format } from 'date-fns';

const handleExport = (plans: WithId<FuturePlan>[]) => {
  const doc = new jsPDF();
  doc.text("SpendWise Future Plans Report", 14, 16);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

  const tableColumn = ["Target Date", "Description", "Category", "Amount"];
  const tableRows = plans.map(plan => [
      format(new Date(plan.targetDate), 'PPP'),
      plan.description,
      plan.category,
      formatCurrency(plan.amount)
  ]);
  
  doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] },
  });

  doc.save('spendwise_future_plans_report.pdf');
};


export default function PlansPage() {
  const { futurePlans } = useSpendWise();
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 md:space-x-2">
        <h2 className="text-3xl font-bold tracking-tight">Future Plans</h2>
        <div className="flex items-center space-x-2">
           <Button variant="outline" onClick={() => handleExport(futurePlans)}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
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
