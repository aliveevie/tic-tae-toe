import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/client-layout";

export const metadata: Metadata = {
  title: "Tic Tac Toe",
  description: "Play Tic Tac Toe on Stacks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
