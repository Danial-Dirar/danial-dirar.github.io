import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DepthGauge } from "@/components/layout/depth-gauge";
import { MotionProvider } from "@/components/motion/motion-provider";
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
    // The site is dark only. `dark` ships in the static HTML (shadcn's `dark:`
    // variant keys off it) and no script ever removes it.
    // data-scroll-behavior: Next skips the CSS smooth scroll on route changes.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`dark ${geistSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      {/* suppressHydrationWarning: browser extensions inject attributes on
          <body> before React hydrates. */}
      <body suppressHydrationWarning className="flex min-h-full flex-col">
        <MotionProvider>
          <Navbar />
          <DepthGauge />
          <main className="flex-1">{children}</main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
