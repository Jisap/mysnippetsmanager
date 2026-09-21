import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Footer } from "@/components/footer";

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fontHeading = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'SnippetManager — Tu gestor de código',
    template: '%s · SnippetManager',
  },
  description: 'Guarda, organiza y busca tus snippets de código favoritos con resaltado de sintaxis.',
  openGraph: {
    type: 'website',
    siteName: 'SnippetManager',
    title: 'SnippetManager — Tu gestor de código',
    description: 'Guarda, organiza y busca tus snippets de código favoritos con resaltado de sintaxis.',
  },
  twitter: {
    card: 'summary',
    title: 'SnippetManager — Tu gestor de código',
    description: 'Guarda, organiza y busca tus snippets de código favoritos con resaltado de sintaxis.',
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fontSans.variable} ${fontHeading.variable} ${fontMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Navbar />
        <Breadcrumbs />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

