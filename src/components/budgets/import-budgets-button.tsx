
'use client';

import { useRef, useState } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { useSpendWise } from '@/contexts/spendwise-context';
import { useToast } from '@/hooks/use-toast';
import { CATEGORIES } from '@/lib/constants';
import type { Budget, Category } from '@/lib/types';

// Expected CSV headers: Category,Amount
interface CsvData {
    Category: string;
    Amount: string;
}

export function ImportBudgetsButton({ variant = 'outline', ...props }: ButtonProps) {
  const { setBudgets } = useSpendWise();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const processBudgets = (budgets: Omit<Budget, 'userId' | 'spent' | 'spendingHistory'>[]) => {
      let importedCount = 0;
      let errorCount = 0;
      const budgetsToSet: Omit<Budget, 'userId'>[] = [];

      budgets.forEach((budget, index) => {
          const { category, amount } = budget;
          
          if (!category || amount === undefined) {
              console.warn(`Skipping budget index ${index}: Missing required fields.`, budget);
              errorCount++;
              return;
          }

          if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
              console.warn(`Skipping budget index ${index}: Invalid amount.`, budget);
              errorCount++;
              return;
          }

          if (!CATEGORIES.includes(category as Category) || category === 'Salary') {
              console.warn(`Skipping budget index ${index}: Invalid or non-budgetable category.`, budget);
              errorCount++;
              return;
          }

          budgetsToSet.push({
              category: category as Category,
              amount: amount,
          });
          importedCount++;
      });
      
      if (budgetsToSet.length > 0) {
        setBudgets(budgetsToSet);
      }
      
      return { importedCount, errorCount };
  }


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    
    setIsImporting(true);

    if (file.type === 'text/csv') {
        const Papa = (await import('papaparse')).default;
        Papa.parse<CsvData>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const budgetsToProcess = results.data.map(row => ({
                    category: row.Category,
                    amount: parseFloat(row.Amount),
                }));
                const { importedCount, errorCount } = processBudgets(budgetsToProcess as any);

                toast({
                    title: "CSV Import Complete",
                    description: `${importedCount} budgets imported. ${errorCount > 0 ? `${errorCount} rows had errors.` : ''}`,
                });
                setIsImporting(false);
            },
            error: (error) => {
                toast({
                    variant: "destructive",
                    title: "Import Failed",
                    description: `Error parsing CSV: ${error.message}`,
                });
                setIsImporting(false);
            }
        });
    } else {
        toast({
            variant: "destructive",
            title: "Unsupported File Type",
            description: "Please upload a .csv file.",
        });
        setIsImporting(false);
    }


    // Reset file input
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv"
        disabled={isImporting}
      />
      <Button variant={variant} onClick={handleButtonClick} {...props} disabled={isImporting}>
        {isImporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
            <Upload className="mr-2 h-4 w-4" />
        )}
        Import
      </Button>
    </>
  );
}
