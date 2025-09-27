'use client';

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useSpendWise } from '@/contexts/spendwise-context';
import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { getCSSVariableValue } from '@/lib/css-var';

export function DailySpendingChart() {
  const { expenses } = useSpendWise();
  const now = new Date();

  const chartData = useMemo(() => {
    const dailyTotals: { [key: string]: number } = {};
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // Initialize all days of the month with 0 total
    for (let i = 1; i <= daysInMonth; i++) {
        const day = i.toString().padStart(2, '0');
        dailyTotals[day] = 0;
    }

    expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expense.category !== 'Salary' &&
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      })
      .forEach((expense) => {
        const day = new Date(expense.date).getDate().toString().padStart(2, '0');
        dailyTotals[day] += expense.amount;
      });
    
    return Object.entries(dailyTotals).map(([day, total]) => ({
      date: day,
      total,
    })).sort((a,b) => parseInt(a.date) - parseInt(b.date));

  }, [expenses, now]);

  const chartConfig = {
    total: {
      label: 'Total Spent',
      color: `hsl(${getCSSVariableValue('chart-1')})`,
    },
  };

  if (chartData.every(d => d.total === 0)) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground">
        No spending data for this month.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value as number)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                labelFormatter={(label) => {
                    const date = new Date(now.getFullYear(), now.getMonth(), parseInt(label));
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
                formatter={(value) => [formatCurrency(value as number), 'Spent']}
              />}
            />
            <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
