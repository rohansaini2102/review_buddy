import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Review Buddy - Turn Happy Customers Into 5-Star Reviews",
  description:
    "93% of people read reviews before buying. Only 5% leave them. Review Buddy makes it easy for your customers to leave Google reviews with pre-written templates.",
  keywords: [
    "google reviews",
    "review management",
    "customer reviews",
    "business reviews",
    "review templates",
  ],
  openGraph: {
    title: "Review Buddy - Turn Happy Customers Into 5-Star Reviews",
    description:
      "Make it easy for your customers to leave Google reviews with pre-written templates.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
