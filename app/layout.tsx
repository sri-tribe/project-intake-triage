import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import { getSessionUser } from "@/lib/session";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Intake triage",
  description: "Project intake triage",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders user={user}>{children}</AppProviders>
      </body>
    </html>
  );
}
