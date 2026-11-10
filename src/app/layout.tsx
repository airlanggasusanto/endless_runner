import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Endless Runner 2D",
  description: "a 2D car endless runner game",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      {/* Added fixed, inset-0, and overflow-hidden here */}
      <body className="fixed inset-0 flex flex-col overflow-hidden overscroll-none touch-none">
        {children}
      </body>
    </html>
  );
}
