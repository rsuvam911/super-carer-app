import AuthCheck from "@/components/auth-check";
import { Providers } from "@/components/providers";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Super Carer App",
  description: "Dashboard for care providers",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <AuthCheck>{children}</AuthCheck>
        </Providers>
      </body>
    </html>
  );
}
