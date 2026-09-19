import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "ECE Football Fiesta 2026 | Official Auction & Tournament Hub",
  description: "Official web application for ECE Football Fiesta 2026 offline player auction, group stage fixtures, automated standings, player statistics, and tournament rules.",
  keywords: ["ECE Football Fiesta", "ECE 2026", "Player Auction", "Football Tournament", "Fixtures", "Standings"],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className="stadium-bg min-h-screen flex flex-col antialiased text-white">
        <AppProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
