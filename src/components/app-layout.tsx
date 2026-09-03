import { Outlet } from 'react-router-dom';
import { BottomNav } from '@/components/bottom-nav';

export function AppLayout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <main className="flex-1 px-4 pb-24 pt-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
