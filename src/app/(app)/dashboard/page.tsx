import { DeliveryChart } from '@/components/dashboard/delivery-chart';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <StatsCards />
      <Card>
        <CardHeader>
          <CardTitle>Delivery Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <DeliveryChart />
        </CardContent>
      </Card>
    </div>
  );
}
