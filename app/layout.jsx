import './globals.css';
import { ToastProvider } from '@/hooks/useToast';
import { DashboardShell } from '@/components/DashboardShell';

export const metadata = {
  title: 'ReturnDesk — Support Return Management System',
  description: 'Enterprise return & replacement management dashboard for customer support teams.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <ToastProvider>
          <DashboardShell>{children}</DashboardShell>
        </ToastProvider>
      </body>
    </html>
  );
}
