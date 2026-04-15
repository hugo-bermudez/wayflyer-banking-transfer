import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Transfer - Wayflyer Banking",
  description: "Send money between your accounts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
