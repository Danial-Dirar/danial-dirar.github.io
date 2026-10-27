/**
 * Work and education, newest first — taken from the CV
 * (public/cv/danial-dirar-cv.pdf). Keep the two in step.
 */

export type TimelineEntry = {
  title: string;
  org: string;
  /** Human-readable range, e.g. "Jul 2026 – present". */
  when: string;
  detail: string;
  current?: boolean;
};

export const experience: TimelineEntry[] = [
  {
    title: "Business Development Executive",
    org: "Codexa IT LLC",
    when: "Aug 2026 – present",
    detail:
      "Supports business development for a US-based property-preservation outsourcing company, working with its American clients and field vendor network.",
    current: true,
  },
  {
    title: "Founder",
    org: "Haifa Intelligence, AI/ML studio",
    when: "Jul 2026 – present",
    detail:
      "Runs an independent studio building local-first, privacy-respecting AI tools — including Haifa HiveMind — and generative image and video pipelines in ComfyUI with custom LoRA models, all on local GPUs.",
    current: true,
  },
  {
    title: "Chief Communication Officer",
    org: "AFK Productions",
    when: "Feb 2025 – Jun 2025",
    detail:
      "Led communications for esports events run with brands including MSI, ASUS ROG and Acer Predator.",
  },
  {
    title: "Entry Level Software Engineer (part-time)",
    org: "Arabian Gulf Associates Co. Ltd",
    when: "Jul 2024 – Oct 2024",
    detail: "Worked part-time as a technical IT engineer at a recruiting agency.",
  },
  {
    title: "Founder and Owner",
    org: "Steam Store Bangladesh",
    when: "Jul 2016 – 2026",
    detail:
      "Founded and ran an online store selling digital products for ten years, handling day-to-day operations, PR and customer communication.",
  },
];

export const education: TimelineEntry[] = [
  {
    title: "B.Sc. (Hons.) in Computer Science and Engineering",
    org: "BRAC University",
    when: "Jun 2022 – present",
    detail:
      "Thesis: forecasting groundwater levels in the Barind region of northwest Bangladesh from historical hydrological and environmental data.",
    current: true,
  },
];

export const achievements = [
  {
    title: "6th place, National Programming Contest",
    when: "2017",
    detail: "Placed sixth nationally in a programming contest organised by a2i, Bangladesh.",
  },
] as const;
