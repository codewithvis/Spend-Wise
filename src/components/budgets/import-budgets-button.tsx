
'use client';

import { useRef, useState } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { useSpendWise } from '@/contexts/spendwise-context';
import { useToast } from '@/hooks/use-toast';
import { CATEGORIES } from '@/lib/constants';
import type { Budget, Category } from '@/lib/types';
import { getBudgetsFromText, parsePdf } from '@/app/actions';

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
  
  const handleAiImport = async (text: string) => {
    setIsImporting(true);
    const { data, error } = await getBudgetsFromText(text);

    if (error || !data) {
        toast({
            variant: "destructive",
            title: "AI Import Failed",
            description: error || "The AI could not extract any budgets from the file.",
        });
        setIsImporting(false);
        return;
    }

    const { importedCount, errorCount } = processBudgets(data);

    toast({
        title: "AI Import Complete",
        description: `${importedCount} budgets imported. ${errorCount > 0 ? `${errorCount} were skipped.` : ''}`,
    });
    setIsImporting(false);
  }


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    
    setIsImporting(true);

    if (file.type === 'text/plain') {
        const text = await file.text();
        await handleAiImport(text);
    } else if (file.type === 'application/pdf') {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const text = await parsePdf(buffer);
            await handleAiImport(text);
        } catch (error) {
            console.error("PDF parsing error", error);
            toast({
                variant: 'destructive',
                title: 'PDF Import Failed',
                description: 'Could not extract text from the PDF file.',
            });
            setIsImporting(false);
        }
    } else {
        toast({
            variant: "destructive",
            title: "Unsupported File Type",
            description: "Please upload a .txt or .pdf file.",
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
        accept=".txt,.pdf"
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
