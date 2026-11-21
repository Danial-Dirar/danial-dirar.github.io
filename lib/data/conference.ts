/**
 * The most recent conference acceptance, shown as a "pass" on /research.
 * Everything here is from the revised extended abstract sent to ICWFM-2027
 * and from the conference's own site (icwfm2027.com).
 */

import type { ResearchPaper } from "@/lib/data/research";

export type ConferenceLogo = {
  src: string;
  alt: string;
  /** What the logo stands for on the pass, e.g. "the conference". */
  caption: string;
  width: number;
  height: number;
};

export const latestConference = {
  status: "abstract accepted",
  conference: "11th International Conference on Water and Flood Management",
  short: "ICWFM-2027",
  theme: "Securing Water for People and Planet",
  dates: "24–26 January 2027",
  venue: "BUET, Dhaka",
  url: "https://icwfm2027.com/",
  title:
    "Sustainable Groundwater Management in the Barind Tract: Machine-Learning Forecasts Validated Independently",
  authors: [
    { name: "Md. Danial Dirar", self: true },
    { name: "Md. Raisul Islam" },
    { name: "Md. Iquebal Hossain" },
    { name: "Mohammad Salah Uddin" },
    { name: "Mohammad Kaykobad" },
  ],
  affiliations: "BRAC University · Prime University · Institute of Water Modelling",
  data: "109 BWDB wells, 2006–2021, checked against 17 independent BMDA wells",
  changes: [
    { sign: "-", value: "1.46 m", label: "one-month error, persistence (last level)" },
    { sign: "+", value: "1.12 m", label: "change-target XGBoost, 23% skill" },
    { sign: "+", value: "1.1–1.9 m", label: "error 1 to 6 months ahead" },
    { sign: "-", value: "63–67%", label: "coverage of nominal 90% intervals" },
    { sign: "+", value: "80–93%", label: "after conformal calibration" },
    { sign: "+", value: "73%", label: "of monthly changes agree with BMDA wells" },
  ] satisfies NonNullable<ResearchPaper["changes"]>,
  /** The finding the abstract is honest about. */
  caveat:
    "The model matches seasonal persistence rather than beating it: most of the skill is the season, and the abstract says so.",
  logos: [
    {
      src: "/conference/icwfm-2027.webp",
      alt: "ICWFM 2027 logo",
      caption: "the conference",
      width: 163,
      height: 204,
    },
    {
      src: "/conference/buet.svg",
      alt: "Bangladesh University of Engineering and Technology (BUET) logo",
      caption: "host · IWFM, BUET",
      width: 316,
      height: 316,
    },
    {
      src: "/conference/brac-university.svg",
      alt: "BRAC University logo",
      caption: "from · BRAC University",
      width: 250,
      height: 240,
    },
  ] satisfies ConferenceLogo[],
};
