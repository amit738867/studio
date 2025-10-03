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
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change} from last month</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
