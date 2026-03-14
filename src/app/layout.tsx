
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: 'המצפן הרגשי 🧭 | Emotional Compass',
  description: 'ארגז הכלים לחוסן ושקט נפשי',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'המצפן הרגשי',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&family=Heebo:wght@100;300;400;500;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground overflow-x-hidden">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
