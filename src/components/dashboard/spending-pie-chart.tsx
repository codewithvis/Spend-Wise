'use client';

import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { useSpendWise } from '@/contexts/spendwise-context';
import { useMemo } from 'react';
import { CATEGORIES } from '@/lib/constants';
import { getCSSVariableValue } from '@/lib/css-var';

export function SpendingPieChart() {
  const { expenses } = useSpendWise();
  const now = new Date();

  const chartData = useMemo(() => {
    const data = CATEGORIES.map((category) => {
      if (category === 'Salary') return null;
      const total = expenses
        .filter((expense) => {
          const expenseDate = new Date(expense.date);
          return expense.category === category && expense.amount > 0 &&
                 expenseDate.getMonth() === now.getMonth() &&
                 expenseDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

      return {
        category,
        total,
        fill: 'var(--chart-1)', // Placeholder, will be replaced
      };
    }).filter(item => item && item.total > 0);
    
    return data.sort((a,b) => b!.total - a!.total);

  }, [expenses, now]);

  const chartConfig = useMemo(() => {
    const config = {};
    chartData.forEach((item, index) => {
      if(item) {
        const chartColor = getCSSVariableValue(`chart-${(index % 5) + 1}`)
        config[item.category] = {
          label: item.category,
          color: `hsl(${chartColor})`,
        };
      }
    });
    return config;
  }, [chartData]);


  if (chartData.length === 0) {
    return <div className="flex h-64 w-full items-center justify-center text-muted-foreground">No spending data for this month.</div>;
  }

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel nameKey="category" />}
        />
        <Pie
          data={chartData}
          dataKey="total"
          nameKey="category"
          innerRadius={60}
          strokeWidth={5}
        >
          {chartData.map((entry, index) => (
             entry && <Cell key={`cell-${index}`} fill={chartConfig[entry.category]?.color || 'hsl(var(--chart-1))'} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="category" />} />
      </PieChart>
    </ChartContainer>
  );
}
