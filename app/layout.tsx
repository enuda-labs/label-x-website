import type { Metadata } from "next";
import { Roboto, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

// Body font
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-roboto",
});

// Heading font
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: 'LabelX - AI Data Processing with Human Review',
  description: 'AI-powered content moderation with human precision',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.className} ${roboto.variable} ${spaceGrotesk.variable}`}
      >
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-[#191c21] via-[#1e1e1e] to-[#111418] text-gray-200">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}