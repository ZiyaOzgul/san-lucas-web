import type { Metadata } from "next";
import { Epilogue, Inter } from "next/font/google";
import "./globals.css";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "San Lucas",
  description: "San Lucas Cafe — QR Menu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${epilogue.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full bg-[url('/background.png')] bg-cover bg-center bg-fixed">{children}</body>
    </html>
  );
}
