import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WINGMAN | Autonomous Journey Continuity Agent",
  description: "Your journey has your back. The booking is a transaction. The journey is the outcome.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090a0f] text-[#f4f4f5] min-h-screen selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
