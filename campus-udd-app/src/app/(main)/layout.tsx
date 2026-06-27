import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 w-full h-full bg-slate-50 relative">
      <TopBar />
      
      {/* 
        The main content area must take up the rest of the height. 
        On mobile, we leave bottom padding to not cover content with the BottomNav.
      */}
      <main className="flex-1 flex flex-col overflow-y-auto pb-16 md:pb-0 relative">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
