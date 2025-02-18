import '@workspace/ui/globals.css';
import './globals.css';

import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import Providers from './providers';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata = {
  title: 'Next MW - Next.js Middlewares',
  description: 'Create multiple middlewares quickly and easily in Next.js',
  keywords: [
    'next',
    'middleware',
    'middlewares',
    'next-mw',
    'next-middleware',
    'next-middlewares',
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="DvEmYfEcqg4qdrj348IH1EyyCQXagUvrXC9JzHcE6nU"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          theme={{
            defaultTheme: 'dark',
          }}
        >
          <Providers>{children}</Providers>
        </RootProvider>
      </body>
    </html>
  );
}
