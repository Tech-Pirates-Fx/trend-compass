import type { Metadata } from "next";
import "./globals.css";
import { ExpeditionProvider } from '../components/Expedition';
import { DataControlProvider } from '../components/DataControl';
import { SceneTransition } from '../components/SceneTransition';
import { AppShell } from '../components/AppShell';

export const metadata: Metadata = {
  title: "Trend Compass | Tech Pirates",
  description:
    "Explore long-term environmental trends across Earth science variables with robust statistical detection and plain-language interpretation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased">
        <script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.classList.toggle('dark',localStorage.getItem('tc-theme')!=='light')}catch(e){}` }} />
        <a className="skip-link" href="#main-content">Skip to content</a>
        <ExpeditionProvider>
        <DataControlProvider>
        <SceneTransition/>
        <AppShell>
          {children}
        </AppShell>
        </DataControlProvider>
        </ExpeditionProvider>
      </body>
    </html>
  );
}
