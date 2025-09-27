
'use client';

import { useRef } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useSpendWise } from '@/contexts/spendwise-context';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { CATEGORIES } from '@/lib/constants';

// Expected headers: Date,Description,Amount,Category
interface CsvData {
    Date: string;
    Description: string;
    Amount: string;
    Category: string;
}

export function ImportExpensesButton({ variant = 'outline', ...props }: ButtonProps) {
  const { addExpense } = useSpendWise();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    Papa.parse<CsvData>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let importedCount = 0;
        let errorCount = 0;

        results.data.forEach((row, index) => {
            const { Date: date, Description, Amount, Category } = row;
            
            if (!date || !Description || !Amount || !Category) {
                console.warn(`Skipping row ${index + 2}: Missing required fields.`, row);
                errorCount++;
                return;
            }

            const amount = parseFloat(Amount);
            if (isNaN(amount)) {
                console.warn(`Skipping row ${index + 2}: Invalid amount.`, row);
                errorCount++;
                return;
            }

            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                console.warn(`Skipping row ${index + 2}: Invalid date.`, row);
                errorCount++;
                return;
            }

            if (!CATEGORIES.includes(Category as any)) {
                console.warn(`Skipping row ${index + 2}: Invalid category.`, row);
                errorCount++;
                return;
            }

            addExpense({
                date: parsedDate.toISOString(),
                description: Description,
                amount: amount,
                category: Category,
            });
            importedCount++;
        });

        toast({
            title: "Import Complete",
            description: `${importedCount} expenses imported successfully. ${errorCount > 0 ? `${errorCount} rows had errors and were skipped.` : ''}`,
        });
      },
      error: (error) => {
        toast({
            variant: "destructive",
            title: "Import Failed",
            description: `There was an error parsing the CSV file: ${error.message}`,
        });
      }
    });

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
      />
      <Button variant={variant} onClick={handleButtonClick} {...props}>
        <Upload className="mr-2 h-4 w-4" />
        Import
      </Button>
    </>
  );
}
