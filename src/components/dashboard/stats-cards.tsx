import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Send, TrendingUp, XCircle } from 'lucide-react';

const stats = [
  {
    title: 'Total Sent',
    value: '12,540',
    icon: Send,
    change: '+2.5%',
  },
  {
    title: 'Delivery Rate',
    value: '98.2%',
    icon: TrendingUp,
    change: '+0.2%',
  },
  {
    title: 'Delivered',
    value: '12,314',
    icon: CheckCircle,
    change: '+2.6%',
  },
  {
    title: 'Failed',
    value: '226',
    icon: XCircle,
    change: '-1.1%',
  },
];

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <p className="text-xs text-gray-400">{stat.change} from last month</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}