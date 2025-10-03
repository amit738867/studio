'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { ChartConfig } from '@/components/ui/chart';

const chartData = [
  { month: 'January', delivered: 186, failed: 80 },
  { month: 'February', delivered: 305, failed: 200 },
  { month: 'March', delivered: 237, failed: 120 },
  { month: 'April', delivered: 73, failed: 190 },
  { month: 'May', delivered: 209, failed: 130 },
  { month: 'June', delivered: 214, failed: 140 },
];

const chartConfig = {
  delivered: {
    label: 'Delivered',
    color: '#4ade80', // green-500
  },
  failed: {
    label: 'Failed',
    color: '#f87171', // red-400
  },
} satisfies ChartConfig;

export function DeliveryChart() {
  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} stroke="#334155" />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tick={{ fill: '#94a3b8' }}
          />
          <YAxis 
            tick={{ fill: '#94a3b8' }}
            stroke="#334155"
          />
          <ChartTooltip 
            content={<ChartTooltipContent />} 
            wrapperClassName="bg-gray-800 border-gray-700 text-white"
          />
          <Bar dataKey="delivered" fill="var(--color-delivered)" radius={4} />
          <Bar dataKey="failed" fill="var(--color-failed)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}