import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import "./globals.css";
import ClientWrapper from "./components/ClientWrapper";
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
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <link rel="icon" href="/logo.png" />
      </head>
      <body
        suppressHydrationWarning
        className={`${manrope.variable} ${newsreader.variable} font-body bg-surface text-on-surface antialiased selection:bg-secondary-container selection:text-on-secondary-container`}
      >
        <Providers>
          <ClientWrapper>{children}</ClientWrapper>
        </Providers>
      </body>
    </html>
  );
}
