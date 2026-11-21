/**
 * Work and education, newest first — taken from the CV
 * (public/cv/danial-dirar-cv.pdf). Keep the two in step.
 */

/** An organisation's mark. Entries without one get a monogram tile. */
export type EntryLogo = {
  src: string;
  width: number;
  height: number;
  /** "paper" (default) for marks on white, "dark" for white-on-black marks,
   *  "cover" for a mark that brings its own background and fills the tile. */
  tile?: "paper" | "dark" | "cover";
};

export type TimelineEntry = {
  title: string;
  org: string;
  logo?: EntryLogo;
  /** Human-readable range, e.g. "Jul 2026 – present". */
  when: string;
  detail: string;
  current?: boolean;
};

export const experience: TimelineEntry[] = [
  {
    title: "Executive (AI Engineering)",
    org: "Divergent Technologies Limited",
    logo: { src: "/logos/org/divergent.png", width: 84, height: 100 },
    when: "Nov 2026 – present",
    detail:
      "Builds business-tailored video generation workflows in ComfyUI and automation tools at an IT solutions firm serving clients in fintech, telecom and healthcare.",
    current: true,
  },
  {
    title: "Business Development Executive",
    org: "Codexa IT LLC",
    logo: { src: "/logos/org/codexa.png", width: 318, height: 88 },
    when: "Aug 2026 – Oct 2026",
    detail:
      "Supported business development for a US-based property-preservation outsourcing company, working with its American clients and field vendor network.",
  },
  {
    title: "Founder",
    org: "Haifa Intelligence, AI/ML studio",
    logo: { src: "/logos/org/haifa-intelligence.svg", width: 64, height: 64 },
    when: "Jul 2026 – present",
    detail:
      "Runs an independent studio building local-first, privacy-respecting AI tools — including Haifa HiveMind — and generative image and video pipelines in ComfyUI with custom LoRA models, all on local GPUs.",
    current: true,
  },
  {
    title: "Chief Communication Officer",
    org: "AFK Productions",
    logo: { src: "/logos/org/afk-productions.webp", width: 400, height: 203, tile: "dark" },
    when: "Feb 2025 – Jun 2025",
    detail:
      "Led communications for esports events run with brands including MSI, ASUS ROG and Acer Predator.",
  },
  {
    title: "Entry Level Software Engineer (part-time)",
    org: "Arabian Gulf Associates Co. Ltd",
    logo: { src: "/logos/org/agaco.webp", width: 240, height: 240 },
    when: "Jul 2024 – Oct 2024",
    detail: "Worked part-time as a technical IT engineer at a recruiting agency.",
  },
  {
    title: "Founder and Owner",
    org: "Steam Store Bangladesh",
    logo: { src: "/logos/org/steam-store-bd.webp", width: 240, height: 240, tile: "cover" },
    when: "Jul 2016 – 2026",
    detail:
      "Founded and ran an online store selling digital products for ten years, handling day-to-day operations, PR and customer communication.",
  },
];

export const education: TimelineEntry[] = [
  {
    title: "B.Sc. (Hons.) in Computer Science and Engineering",
    org: "BRAC University",
    logo: { src: "/logos/org/brac-university.svg", width: 250, height: 240 },
    when: "Jun 2022 – Oct 2026",
    detail:
      "Thesis: forecasting groundwater levels in the Barind region of northwest Bangladesh from historical hydrological and environmental data, with PyTorch models that currently reach an R² of about 0.93.",
  },
  {
    title: "Higher Secondary Certificate (HSC)",
    org: "Govt. City College, Rajshahi",
    logo: { src: "/logos/org/city-college-rajshahi.webp", width: 200, height: 200 },
    when: "2021",
    detail: "GPA 5.00 out of 5.00.",
  },
  {
    title: "Secondary School Certificate (SSC)",
    org: "Govt. Laboratory High School, Rajshahi",
    logo: { src: "/logos/org/lab-school-rajshahi.svg", width: 750, height: 750 },
    when: "2019",
    detail: "GPA 5.00 out of 5.00.",
  },
];

export const achievements = [
  {
    title: "6th place, National Programming Contest",
    when: "2017",
    detail: "Placed sixth nationally in a programming contest organised by a2i, Bangladesh.",
    org: "a2i (Access to Information), ICT Division, Government of Bangladesh",
    logo: { src: "/logos/org/a2i.svg", alt: "a2i logo", width: 300, height: 309 },
  },
] as const;
