import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalLayout } from "@/components/layout";
import { AuthProvider } from "@/lib/auth/context";
import { ToastProvider } from "@/lib/toast/context";
import { SiteDataProvider } from "@/lib/admin/context";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

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
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <SiteDataProvider>
          <AuthProvider>
            <ToastProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </ToastProvider>
          </AuthProvider>
        </SiteDataProvider>
      </body>
    </html>
  );
}
