import { AdminAuthProvider } from '@/lib/admin/context';
import { AuthProvider } from '@/lib/auth/context';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AdminAuthProvider>
  );
}
