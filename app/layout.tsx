import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { themeInitScript } from "@/components/theme/theme-script";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { site } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `dark` ships in the static HTML because dark is the site default — the
    // first painted frame is already dark, with no script needed.
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${geistSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <head>
        {/* A plain inline script, NOT next/script: this has to run synchronously
            before the body paints, and only undoes `dark` for visitors who
            explicitly chose light. See components/theme/theme-script.ts. */}
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      {/* suppressHydrationWarning: browser extensions inject attributes on
          <body> before React hydrates. */}
      <body suppressHydrationWarning className="flex min-h-full flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
