import type { Metadata } from "next";
import "./globals.css";
import { ConditionalLayout } from "@/components/layout";
import { AuthProvider } from "@/lib/auth/context";
import { SiteDataProvider } from "@/lib/admin/context";
import { LanguageProvider } from "@/lib/lang/LanguageContext";
import Script from "next/script";
import { Toaster } from "sonner";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";

export const metadata: Metadata = {
  title: "Grow Your Business Identity with Motion Booster",
  description:
    "Enhance your customer interactions and streamline your sales processes with our powerful and intuitive CRM solution.",
  icons: {
    icon: "/BlackMonogram1.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      {GTM_ID && (
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      )}
      <body className="antialiased overflow-x-hidden" suppressHydrationWarning>
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <LanguageProvider>
          <SiteDataProvider>
            <AuthProvider>
              <Toaster position="top-right" richColors />
              <ConditionalLayout>{children}</ConditionalLayout>
            </AuthProvider>
          </SiteDataProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
