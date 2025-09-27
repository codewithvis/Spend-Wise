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
import { CalendarIcon, Wand2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CATEGORIES } from '@/lib/constants';
import type { Category, Expense } from '@/lib/types';
import { useSpendWise } from '@/contexts/spendwise-context';
import { getCategorySuggestion } from '@/app/actions';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WithId } from '@/firebase';

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
  const { addExpense, editExpense } = useSpendWise();
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const isEditMode = !!expense;

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

  async function onSubmit(values: ExpenseFormValues) {
    if (isEditMode) {
      editExpense({ ...values, date: values.date.toISOString(), id: expense.id, userId: expense.userId });
      toast({
        title: 'Expense Updated',
        description: `Successfully updated "${values.description}".`,
      });
    } else {
      addExpense({ ...values, date: values.date.toISOString() });
      toast({
        title: 'Expense Added',
        description: `Successfully added "${values.description}".`,
      });
    }
    onFinished();
  }

  const handleSuggestCategory = async () => {
    const description = form.getValues('description');
    if (!description) {
      form.setError('description', {
        type: 'manual',
        message: 'Please enter a description first.',
      });
      return;
    }

    setIsSuggesting(true);
    const { data, error } = await getCategorySuggestion(description);
    setIsSuggesting(false);

    if (data) {
      form.setValue('category', data.category as Category, { shouldValidate: true });
      toast({
        title: 'Category Suggested',
        description: `We suggest "${data.category}" for this expense.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Suggestion Failed',
        description: error || 'Could not suggest a category.',
      });
    }
  };

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
                <Input placeholder="e.g., Coffee with a friend" {...field} />
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
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
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
              <div className="flex gap-2">
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.filter(c => c !== 'Salary').map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleSuggestCategory}
                  disabled={isSuggesting}
                  aria-label="Suggest Category"
                >
                  {isSuggesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {isEditMode ? 'Save changes' : 'Save expense'}
        </Button>
      </form>
    </Form>
  );
}
