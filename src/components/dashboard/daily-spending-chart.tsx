'use client';

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useSpendWise } from '@/contexts/spendwise-context';
import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { getCSSVariableValue } from '@/lib/css-var';
import { CATEGORIES } from '@/lib/constants';
import type { Category } from '@/lib/types';


export function DailySpendingChart() {
  const { expenses } = useSpendWise();
  const now = new Date();

  const { chartData, topCategories } = useMemo(() => {
    const dailyTotals: { [day: string]: { [category: string]: number } } = {};
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    const monthlyCategoryTotals: Record<string, number> = {};
    
    const currentMonthExpenses = expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expense.category !== 'Salary' &&
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      });

    currentMonthExpenses.forEach(expense => {
      monthlyCategoryTotals[expense.category] = (monthlyCategoryTotals[expense.category] || 0) + expense.amount;
    });

    const sortedCategories = Object.entries(monthlyCategoryTotals)
        .sort(([, a], [, b]) => b - a)
        .map(([category]) => category);
        
    const top3 = sortedCategories.slice(0, 3) as Category[];
    const otherCategories = CATEGORIES.filter(c => c !== 'Salary' && !top3.includes(c));

    // Initialize all days of the month with 0 totals for top categories and 'Other'
    for (let i = 1; i <= daysInMonth; i++) {
        const day = i.toString().padStart(2, '0');
        dailyTotals[day] = {};
        [...top3, 'Other'].forEach(cat => {
            dailyTotals[day][cat] = 0;
        });
    }

    currentMonthExpenses.forEach((expense) => {
        const day = new Date(expense.date).getDate().toString().padStart(2, '0');
        const category = top3.includes(expense.category as Category) ? expense.category : 'Other';
        dailyTotals[day][category] += expense.amount;
    });
    
    const finalChartData = Object.entries(dailyTotals).map(([day, totals]) => ({
      date: day,
      ...totals
    })).sort((a,b) => parseInt(a.date) - parseInt(b.date));

    return { chartData: finalChartData, topCategories: top3 };

  }, [expenses, now]);

  const chartConfig = useMemo(() => {
    const config: any = {};
    const chartColors = ['chart-1', 'chart-2', 'chart-3', 'chart-4'];
    
    topCategories.forEach((cat, index) => {
        config[cat] = {
            label: cat,
            color: `hsl(${getCSSVariableValue(chartColors[index])})`
        };
    });

    config['Other'] = {
        label: 'Other',
        color: `hsl(${getCSSVariableValue(chartColors[3])})`
    };
    
    return config;
  }, [topCategories]);
  
  const allCategories = [...topCategories, 'Other'];

  if (chartData.every(d => allCategories.every(cat => (d[cat] as number || 0) === 0))) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground">
        No spending data for this month.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }} stackOffset="sign">
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
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent
                labelFormatter={(label) => {
                    const date = new Date(now.getFullYear(), now.getMonth(), parseInt(label));
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
                formatter={(value, name) => [formatCurrency(value as number), name as string]}
              />}
            />
            <Legend />
            {allCategories.map(cat => (
                <Bar 
                    key={cat} 
                    dataKey={cat} 
                    stackId="a" 
                    fill={chartConfig[cat].color} 
                    name={cat} 
                    radius={topCategories.indexOf(cat as Category) === topCategories.length - 1 || (cat === 'Other' && topCategories.length === 0) ? [4, 4, 0, 0] : [0,0,0,0]}
                />
            ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
