import type { Metadata } from "next";
import "./globals.css";
import { ConditionalLayout } from "@/components/layout";
import { AuthProvider } from "@/lib/auth/context";
import { SiteDataProvider } from "@/lib/admin/context";
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "MotionBooster - Elevate Your Customer Relationships",
  description: "Enhance your customer interactions and streamline your sales processes with our powerful and intuitive CRM solution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased overflow-x-hidden" suppressHydrationWarning>
        <SiteDataProvider>
          <AuthProvider>
            <Toaster position="top-right" richColors />
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </AuthProvider>
        </SiteDataProvider>
      </body>
    </html>
  );
}
