import { AdminAuthProvider } from '@/lib/admin/context';
import { AuthProvider } from '@/lib/auth/context';
import PageTransition from '@/components/ui/PageTransition';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AuthProvider>
        <PageTransition variant="admin">{children}</PageTransition>
      </AuthProvider>
    </AdminAuthProvider>
  );
}
