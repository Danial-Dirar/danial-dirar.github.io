import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, GraduationCap, Mail, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitHubIcon, LinkedInIcon, WhatsAppIcon } from "@/components/shared/icons";
import { CvDialog } from "@/components/shared/cv-dialog";
import { Timeline } from "@/components/about/timeline";
import { LogoTile, PaperBadges } from "@/components/research/paper-badges";
import { Reveal } from "@/components/motion/reveal";
import { achievements, education, experience } from "@/lib/data/experience";
import { founderPhoto } from "@/lib/data/founder";
import { asset } from "@/lib/asset";
import { doiUrl, publications } from "@/lib/data/publications";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Md. Danial Dirar — ML/AI & software engineer working on machine learning, generative AI, and local AI for business.",
};

const skills = [
  "Machine learning & deep learning",
  "Time-series forecasting & research",
  "Hydrology & GIS (ArcGIS, QGIS)",
  "RAG & local LLM systems",
  "Generative image & video pipelines",
  "Full-stack web (Next.js / NestJS)",
  "Mobile apps with Flutter",
] as const;

export default function AboutPage() {
  return (
    <section className="relative pt-28 pb-20 md:pt-36">
      <div className="absolute inset-0 -z-10 bg-grid mask-fade" />
      <div className="container-page">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_260px] md:items-start xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-14">
          {/* Two explicit columns on wide screens, so the order is fixed: the
              story, work and skills on the left; schooling, achievements and
              papers on the right. One column below xl, in the same order. */}
          <div className="grid gap-12 xl:grid-cols-2 xl:items-start">
          <div className="min-w-0">
            <Reveal>
              <h1 className="font-mono text-2xl font-semibold tracking-tight md:text-3xl">
                <span className="text-primary">$ </span>cat about.md
              </h1>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-5 text-muted-foreground leading-relaxed text-pretty">
                I&apos;m <span className="text-foreground font-medium">{site.fullName}</span> — a
                computer-science engineer from Dhaka, Bangladesh. My research focuses on
                groundwater management and prediction in the Barind region, where I combine
                machine learning, GIS, and environmental data analysis to support managed
                aquifer recharge (MAR) strategies.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 text-muted-foreground leading-relaxed text-pretty">
                Beyond research, I build generative-AI pipelines and private, local AI
                systems tailored for businesses — assistants and RAG stacks that run
                entirely on hardware you control, so sensitive data never leaves the
                building. I ship the software around the models too: web, mobile, and the
                infrastructure between.
              </p>
            </Reveal>

            <section className="mt-10">
              <h2 className="font-mono text-lg font-semibold">
                <span className="text-primary">$ </span>cat experience.log
              </h2>
              <Timeline entries={experience} />
            </section>

            <Reveal delay={0.15}>
              <h2 className="mt-12 font-mono text-lg font-semibold">
                <span className="text-primary">$ </span>ls skills/
              </h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="font-mono text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Reveal>

          </div>

          <div className="min-w-0">
            <section>
              <h2 className="font-mono text-lg font-semibold">
                <span className="text-primary">$ </span>cat education.log
              </h2>
              <Timeline entries={education} />
              <h3 className="mt-8 font-mono text-sm text-muted-foreground">{"// achievements"}</h3>
              <ul className="mt-3 space-y-3">
                {achievements.map((a) => (
                  <li
                    key={a.title}
                    className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/60 p-3 pr-4"
                  >
                    {/* The organiser's mark keeps its colours, so it sits on paper. */}
                    <span className="grid size-16 shrink-0 place-items-center rounded-lg bg-[oklch(0.975_0.006_95)] p-1.5">
                      <Image
                        src={asset(a.logo.src)}
                        alt={a.logo.alt}
                        width={a.logo.width}
                        height={a.logo.height}
                        className="size-full object-contain"
                      />
                    </span>
                    <span className="min-w-0 text-sm text-muted-foreground">
                      <span className="block font-medium text-foreground">
                        {a.title}
                        <span className="ml-1.5 font-mono text-xs font-normal text-primary">{a.when}</span>
                      </span>
                      <span className="mt-0.5 block">{a.detail}</span>
                      <span className="mt-0.5 block font-mono text-[11px]">{a.org}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <Reveal delay={0.2}>
              <h2 className="mt-12 font-mono text-lg font-semibold">
                <span className="text-primary">$ </span>cat publications.bib
              </h2>
              <div className="mt-5 space-y-4">
                {publications.map((pub) => (
                  <article
                    key={pub.doi}
                    className="rounded-xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-3 max-sm:flex-col-reverse max-sm:gap-2.5">
                      <p className="font-mono text-xs text-muted-foreground">
                        {pub.venue} · {pub.year} · {pub.type}
                      </p>
                      {pub.journal && (
                        <LogoTile logo={pub.journal.logo} className="h-7 w-32 shrink-0 px-2.5" />
                      )}
                    </div>
                    <h3 className="mt-2 font-medium leading-snug">
                      <a
                        href={doiUrl(pub.doi)}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-primary"
                      >
                        {pub.title}
                      </a>
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {pub.authors.map((a, i) => (
                        <span key={a.name}>
                          <span className={a.self ? "font-semibold text-foreground" : undefined}>
                            {a.name}
                          </span>
                          {i < pub.authors.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </p>
                    <PaperBadges
                      doi={pub.doi}
                      journal={pub.journal}
                      citations={pub.citations}
                      className="mt-4"
                    />
                  </article>
                ))}
              </div>
            </Reveal>
          </div>
          </div>

          {/* Portrait + facts */}
          <Reveal delay={0.1} className="max-md:order-first md:sticky md:top-24">
            <div className="relative mx-auto w-full max-w-[260px]">
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-brand-1/10 blur-2xl" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-border/60">
                <Image
                  src={asset(founderPhoto.src)}
                  alt={founderPhoto.alt}
                  fill
                  sizes="260px"
                  placeholder="blur"
                  blurDataURL={founderPhoto.blurDataURL}
                  className="object-cover"
                  style={{ objectPosition: "50% 30%" }}
                />
              </div>
            </div>
            <div className="mx-auto mt-5 max-w-[260px] space-y-2.5 font-mono text-[13px]">
              <p className="flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="size-4 shrink-0 text-primary" />
                BSc. (Hons) in Computer Science
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4 shrink-0 text-primary" />
                Dhaka, Bangladesh
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4 shrink-0 text-primary" />
                {site.email}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <WhatsAppIcon className="size-4 shrink-0 text-primary" />
                <a href={site.whatsapp} target="_blank" rel="noreferrer" className="hover:text-primary">
                  {site.phone}
                </a>
              </p>
            </div>
            <div className="mx-auto mt-5 flex max-w-[260px] flex-col gap-2.5">
              <CvDialog />
              {/* Outlined in the accent; a sheen glances across it on hover. */}
              <Button
                asChild
                variant="outline"
                className="btn-glance rounded-full border-primary/60 text-primary hover:border-primary hover:bg-primary/10 hover:text-primary dark:border-primary/60 dark:bg-transparent dark:hover:border-primary dark:hover:bg-primary/10"
              >
                <a href={`mailto:${site.email}`}>
                  <Mail className="size-4" />
                  Get in touch
                </a>
              </Button>
              <Button asChild variant="outline" data-brand="github" className="btn-glance btn-brand rounded-full">
                <a href={site.social.github} target="_blank" rel="noreferrer">
                  <GitHubIcon className="size-4" />
                  GitHub
                </a>
              </Button>
              <Button asChild variant="outline" data-brand="linkedin" className="btn-glance btn-brand rounded-full">
                <a href={site.social.linkedin} target="_blank" rel="noreferrer">
                  <LinkedInIcon className="size-4" />
                  LinkedIn
                </a>
              </Button>
              <Button asChild variant="outline" data-brand="scholar" className="btn-glance btn-brand rounded-full">
                <a href={site.social.scholar} target="_blank" rel="noreferrer">
                  <GraduationCap className="size-4" />
                  Google Scholar
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
              <Button asChild variant="outline" data-brand="orcid" className="btn-glance btn-brand rounded-full">
                <a href={site.social.orcid} target="_blank" rel="noreferrer">
                  <span className="font-mono text-[11px] font-bold">iD</span>
                  ORCID
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
