import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap, Mail, MapPin } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/shared/icons";
import { asset } from "@/lib/asset";
import { founderPhoto } from "@/lib/data/founder";
import { site } from "@/lib/site";

/** The blog's left rail: who is writing, and where else to find him. */
export function AuthorCard() {
  const links = [
    { href: site.social.github, label: "GitHub", icon: <GitHubIcon className="size-4" /> },
    { href: site.social.scholar, label: "Google Scholar", icon: <GraduationCap className="size-4" /> },
    { href: site.social.linkedin, label: "LinkedIn", icon: <LinkedInIcon className="size-4" /> },
    { href: `mailto:${site.email}`, label: "Email", icon: <Mail className="size-4" /> },
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card/60">
      <div
        className="relative aspect-[4/3] bg-cover bg-center"
        style={{ backgroundImage: `url("${founderPhoto.blurDataURL}")` }}
      >
        <Image
          src={asset(founderPhoto.src)}
          alt={founderPhoto.alt}
          fill
          sizes="256px"
          className="object-cover"
          style={{ objectPosition: "50% 45%" }}
        />
      </div>
      <div className="p-4">
        <p className="font-semibold">{site.fullName}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{site.role}</p>
        <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <MapPin className="size-3.5 text-primary" aria-hidden />
          Dhaka, Bangladesh
        </p>
        <ul className="mt-4 grid gap-1 font-mono text-[12px]">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
              >
                <span className="text-primary" aria-hidden>
                  {l.icon}
                </span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <Link
          href="/about"
          className="group mt-3 inline-flex items-center gap-1.5 px-2 font-mono text-[12px] text-primary hover:underline hover:underline-offset-4"
        >
          more about me
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

/** A small titled list for a sidebar: featured projects, more posts. */
export function SideList({
  title,
  items,
}: {
  title: string;
  items: { href: string; label: string; meta?: string }[];
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <h2 className="font-mono text-[12px] text-muted-foreground">
        <span className="text-primary">$ </span>
        {title}
      </h2>
      <ul className="mt-3 grid gap-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-md px-2 py-1.5 transition-colors hover:bg-accent/40"
            >
              <span className="block text-sm leading-snug">{item.label}</span>
              {item.meta && (
                <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{item.meta}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
