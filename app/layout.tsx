import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Header from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";


const RobotoSans = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400","500","600","700"]
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
        className={`${RobotoSans.variable} antialiased`}
      >
        <Header />
      <main className='min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100'>
        {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
