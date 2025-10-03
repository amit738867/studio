import { Header } from '@/components/layout/header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main className="p-4 lg:p-6">{children}</main>
    </div>
  );
}
