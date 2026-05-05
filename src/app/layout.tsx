import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CS Department Support Portal",
  description:
    "Concern-management portal for students, coordinators, secretaries, and department administrators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full`}
    >
      <body className={`${GeistSans.className} min-h-full font-sans`}>
        {children}
      </body>
    </html>
  );
}
