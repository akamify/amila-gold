import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import "./globals.css";
import ClientWrapper from "./components/ClientWrapper";
import MetaPixel from "./components/MetaPixel";
import MaterialSymbolsLoader from "./components/MaterialSymbolsLoader";
import { Providers } from "./context/providers";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Amila Gold | Pure Desi Jaggery",
  description: "The gold standard of ancient agrarian wisdom. Pure, unrefined jaggery harvested with integrity and refined for the modern palate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="icon" href="/logo.png" />
      </head>
      <body
        suppressHydrationWarning
        className={`${manrope.variable} ${newsreader.variable} font-body bg-surface text-on-surface antialiased selection:bg-secondary-container selection:text-on-secondary-container`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            title="Google Tag Manager"
            src="https://www.googletagmanager.com/ns.html?id=GTM-MZ4ZH9PH"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <MetaPixel />
        <MaterialSymbolsLoader />
        <Providers>
          <ClientWrapper>{children}</ClientWrapper>
        </Providers>
      </body>
    </html>
  );
}
