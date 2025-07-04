
import type {Metadata} from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from '@/context/CartContext';
import { PT_Sans, Source_Code_Pro } from 'next/font/google';
import { getThemeSettings } from '@/services/themeService';
import type { ThemeSettings } from '@/lib/types';
import ErrorBoundary from '@/components/core/ErrorBoundary';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-pt-sans',
  display: 'swap',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-source-code-pro',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Urgent Studio',
  description: 'Your creative partner for stunning designs.',
};

const ApplyTheme = ({ theme }: { theme: ThemeSettings }) => {
  const css = `
    :root {
      --background: ${theme.light.background};
      --primary: ${theme.light.primary};
      --accent: ${theme.light.accent};
      --animation-duration: ${theme.light.animatedGradient.duration}s;
    }

    .animated-gradient-text, .animated-gradient-border {
      background-image: linear-gradient(to right, ${theme.light.animatedGradient.colors});
    }
  `;
  // Important: Use a key to avoid re-rendering issues with React
  return <style key={JSON.stringify(theme)} dangerouslySetInnerHTML={{ __html: css }} />;
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeSettings = await getThemeSettings();

  return (
    <html lang="en" className="light">
      <head>
        <ApplyTheme theme={themeSettings} />
      </head>
      <body className={cn(
        "min-h-screen bg-background font-body antialiased",
        ptSans.variable,
        sourceCodePro.variable
      )}>
        <ErrorBoundary>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
