
'use client';

import { useRef, useState } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { useSpendWise } from '@/contexts/spendwise-context';
import { useToast } from '@/hooks/use-toast';
import { CATEGORIES } from '@/lib/constants';
import type { Expense } from '@/lib/types';
import { getExpensesFromText, parsePdf, addExpense as addExpenseAction } from '@/app/actions';
import { useUser } from '@/firebase';

export function ImportExpensesButton({ variant = 'outline', ...props }: ButtonProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const processExpenses = async (expenses: Omit<Expense, 'id' | 'userId'>[]) => {
      let importedCount = 0;
      let errorCount = 0;

      if (!user) {
        toast({ variant: 'destructive', title: 'Not signed in', description: 'You must be signed in to import expenses.'})
        return { importedCount, errorCount };
      }

      for (const expense of expenses) {
          const { date, description, amount, category } = expense;
          
          if (!date || !description || !amount || !category) {
              console.warn(`Skipping expense: Missing required fields.`, expense);
              errorCount++;
              continue;
          }

          if (typeof amount !== 'number' || isNaN(amount)) {
              console.warn(`Skipping expense: Invalid amount.`, expense);
              errorCount++;
              continue;
          }

          const parsedDate = new Date(date);
          if (isNaN(parsedDate.getTime())) {
              console.warn(`Skipping expense: Invalid date.`, expense);
              errorCount++;
              continue;
          }

          if (!CATEGORIES.includes(category as any)) {
              console.warn(`Skipping expense: Invalid category.`, expense);
              errorCount++;
              continue;
          }

          await addExpenseAction({
              userId: user.uid,
              date: parsedDate.toISOString(),
              description: description,
              amount: amount,
              category: category,
          });
          importedCount++;
      };
      
      return { importedCount, errorCount };
  }

  const handleAiImport = async (text: string) => {
    setIsImporting(true);
    const { data, error } = await getExpensesFromText(text);

    if (error || !data) {
        toast({
            variant: "destructive",
            title: "AI Import Failed",
            description: error || "The AI could not extract any expenses from the file.",
        });
        setIsImporting(false);
        return;
    }

    const { importedCount, errorCount } = await processExpenses(data);

    toast({
        title: "AI Import Complete",
        description: `${importedCount} expenses imported. ${errorCount > 0 ? `${errorCount} were skipped.` : ''}`,
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
