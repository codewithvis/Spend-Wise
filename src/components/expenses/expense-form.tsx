
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CATEGORIES } from '@/lib/constants';
import type { Expense } from '@/lib/types';
import { useSpendWise } from '@/contexts/spendwise-context';
import { useToast } from '@/hooks/use-toast';
import { WithId, useUser } from '@/firebase';
import { getCategorySuggestion, addExpense as addExpenseAction } from '@/app/actions';
import { useState } from 'react';
import { Badge } from '../ui/badge';

const formSchema = z.object({
  description: z.string().min(2, {
    message: 'Description must be at least 2 characters.',
  }),
  amount: z.coerce
    .number({ invalid_type_error: 'Amount must be a number.' })
    .positive({ message: 'Amount must be positive.' }),
  date: z.date({ required_error: 'A date is required.' }),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid category.' }),
  }),
});

type ExpenseFormValues = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  onFinished: () => void;
  expense?: WithId<Expense>;
}

export function ExpenseForm({ onFinished, expense }: ExpenseFormProps) {
  const { user } = useUser();
  const { editExpense } = useSpendWise();
  const { toast } = useToast();
  const isEditMode = !!expense;
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<{category: string, confidence: number} | null>(null);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode
      ? {
          ...expense,
          date: new Date(expense.date),
        }
      : {
          description: '',
          amount: undefined,
          date: new Date(),
          category: undefined,
        },
  });

  const handleDescriptionBlur = async () => {
    const description = form.getValues('description');
    if(description && description.length > 2) {
      setIsSuggesting(true);
      setSuggestion(null);
      const { data, error } = await getCategorySuggestion(description);
      if(data) {
        setSuggestion(data);
      }
      if(error) {
        console.warn("AI suggestion error:", error);
      }
      setIsSuggesting(false);
    }
  }

  const applySuggestion = () => {
    if(suggestion) {
      form.setValue('category', suggestion.category as any);
      setSuggestion(null);
    }
  }

  async function onSubmit(values: ExpenseFormValues) {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to perform this action.',
        });
        return;
    }
    
    if (isEditMode) {
      editExpense({ ...values, date: values.date.toISOString(), id: expense.id, userId: expense.userId });
      toast({
        title: 'Expense Updated',
        description: `Successfully updated "${values.description}".`,
      });
    } else {
       const expenseData = {
        ...values,
        userId: user.uid,
        date: values.date.toISOString(),
      };
      const result = await addExpenseAction(expenseData);
      if (result.success) {
        toast({
          title: 'Expense Added',
          description: `Successfully added "${values.description}".`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to Add Expense',
          description: result.error || 'An unknown error occurred.',
        });
      }
    }
    onFinished();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Coffee with friends" {...field} onBlur={handleDescriptionBlur} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col pt-2">
                <FormLabel className='mb-1.5'>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
               <div className='h-5 mt-1'>
                 {isSuggesting && <div className='flex items-center text-xs text-muted-foreground'><Loader2 className='mr-2 h-3 w-3 animate-spin' /><span>Thinking...</span></div>}
                  {suggestion && (
                    <div className='text-xs text-muted-foreground'>
                      AI suggestion: <Button type="button" variant="link" size="sm" className='p-0 h-auto text-xs' onClick={applySuggestion}>{suggestion.category}</Button>
                      <Badge variant="outline" className='ml-1 text-sky-500 border-sky-500'>{Math.round(suggestion.confidence * 100)}% sure</Badge>
                    </div>
                  )}
               </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEditMode ? 'Save changes' : 'Save expense'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
