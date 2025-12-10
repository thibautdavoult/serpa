import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Serpa - People Also Ask Analysis",
  description: "Discover which People Also Ask questions you're missing and capture more organic visibility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
