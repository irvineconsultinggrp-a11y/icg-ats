import type { Metadata } from 'next';
import Image from 'next/image';
import './globals.css';

export const metadata: Metadata = {
  title: 'ICG-ATS | Application Tracking System',
  description: 'Irvine Consulting Group Application Tracking System',
  icons: {
    icon: '/images/ICG 4x4 Transparent White.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white">
        {children}
      </body>
    </html>
  );
}
