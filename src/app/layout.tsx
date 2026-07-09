import type { Metadata } from "next";
import { Geist_Mono, Oswald, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const oswaldHeading = Oswald({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
});

const spaceGroteskSans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://oikos.company";
const siteDescription =
  "Oikos é a plataforma colaborativa que conecta pessoas e organizações para a economia circular de resíduos.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Oikos — Economia circular de resíduos",
    template: "%s | Oikos",
  },
  description: siteDescription,
  keywords: [
    "Oikos",
    "economia circular",
    "gestão de resíduos",
    "reciclagem",
    "sustentabilidade",
  ],
  authors: [{ name: "Oikos" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Oikos",
    title: "Oikos — Economia circular de resíduos",
    description: siteDescription,
    images: [
      { url: "/oikos-logo.png", width: 1024, height: 1024, alt: "Oikos" },
    ],
  },
  twitter: {
    card: "summary",
    title: "Oikos — Economia circular de resíduos",
    description: siteDescription,
    images: ["/oikos-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistMono.variable,
        "font-sans",
        spaceGroteskSans.variable,
        oswaldHeading.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <SiteHeader />
            <main className="flex flex-1 flex-col">{children}</main>
            <SiteFooter />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
