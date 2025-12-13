import type { Metadata } from "next";
import { GenerationManager } from '@/components/generation-manager';
import { Geist, Merriweather, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-serif",
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wikits",
  description: "A Generative Learning Engine.",
};

import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { getSidebarData } from "@/lib/db-queries";
import { VectorBackground } from "@/components/ui/vector-background";
import { Toaster } from "@/components/ui/sonner";

import Script from "next/script";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${merriweather.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground font-sans flex`}
        >
          {/* Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-L2C85H4RB1"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-L2C85H4RB1');
            `}
          </Script>
          {/* Global Background */}
          <div className="fixed inset-0 -z-10">
            <VectorBackground particleCount={60} color="100, 100, 100" />
          </div>

          <Sidebar />
          <main className="relative z-10 flex-1 w-full h-screen overflow-y-auto overflow-x-hidden scroll-smooth">
            {children}
          </main>
          <Inspector />
          <GenerationManager />
          <BottomDock />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}