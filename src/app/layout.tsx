import type { Metadata } from 'next';
import { Playfair_Display, Manrope } from 'next/font/google';
import './globals.css';
import { SiteHeaderWrapper } from '@/components/site-header-wrapper';
import { CartProvider } from '@/components/cart-provider';
import { AppSessionProvider } from '@/components/session-provider';

const displayFont = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
});

const bodyFont = Manrope({
  variable: '--font-body',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Kudla Delights',
  description: 'Mangalorean snacks crafted with coastal warmth, delivered across the UK.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${displayFont.variable} ${bodyFont.variable} bg-amber-50 text-stone-900 antialiased`}
      >
        <AppSessionProvider>
          <CartProvider>
            <SiteHeaderWrapper />
            <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
          </CartProvider>
        </AppSessionProvider>
      </body>
    </html>
  );
}
