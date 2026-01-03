import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/lib/providers/query-provider";
import { ToastProvider } from "@/lib/providers/toast-provider";
import { I18nProvider } from "@/lib/i18n/provider";
import "./globals.css";

// Inter font - optimized for interfaces
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "2BAConcours",
  description: "Plateforme de préparation aux concours pour les étudiants marocains du baccalauréat. Préparez-vous aux concours de MÉDECINE, DENTAIRE, PHARMACIE, ENCG, ENA, ENSA.",
  keywords: ["concours maroc", "2bac", "préparation concours", "médecine", "ENCG", "ENSA", "QCM", "baccalauréat"],
  authors: [{ name: "2BAConcours" }],
  creator: "2BAConcours",
  publisher: "2BAConcours",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans antialiased">
        <I18nProvider initialLocale="en">
          <QueryProvider>
            {children}
            <ToastProvider />
          </QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
