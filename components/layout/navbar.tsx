"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { nav, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-md">
      <div className="container-page flex h-14 items-center justify-between">
        {/* Wordmark — terminal prompt style */}
        <Link
          href="/"
          className="font-mono text-sm font-semibold tracking-tight"
          onClick={() => setOpen(false)}
        >
          <span className="text-primary">{site.handle}</span>
          <span className="text-muted-foreground">@haifa</span>
          <span className="text-muted-foreground">:~$</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "nav-link rounded-md px-3 py-1.5 font-mono text-[13px] transition-colors",
                isActive(item.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive(item.href) ? "> " : ""}
              {item.label.toLowerCase()}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-9 items-center justify-center rounded-full border border-border/60 text-foreground/80"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-border/50 bg-background/95 backdrop-blur-md md:hidden">
          <div className="container-page flex flex-col py-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 font-mono text-sm",
                  isActive(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                {isActive(item.href) ? "> " : ""}
                {item.label.toLowerCase()}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
