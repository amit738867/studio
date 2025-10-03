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
    color: 'hsl(var(--chart-2))',
  },
  failed: {
    label: 'Failed',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

export function DeliveryChart() {
  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="delivered" fill="var(--color-delivered)" radius={4} />
          <Bar dataKey="failed" fill="var(--color-failed)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
