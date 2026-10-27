export const site = {
  name: "Danial Dirar",
  fullName: "Md. Danial Dirar",
  handle: "danial",
  role: "ML & Software Engineer",
  tagline: "Machine Learning · Generative AI · Local AI for business",
  description:
    "Portfolio and blog of Md. Danial Dirar — a computer-science engineer working on machine learning, generative AI, and local AI tailored for businesses.",
  url: "https://danial-dirar.github.io",
  email: "danieldirar@protonmail.com",
  /** Same number as on the CV; WhatsApp takes it without the + or spaces. */
  phone: "+880 1818-843999",
  whatsapp: "https://wa.me/8801818843999",
  location: "Dhaka, Bangladesh · Remote worldwide",
  social: {
    github: "https://github.com/Danial-Dirar",
    scholar: "https://scholar.google.com/citations?user=OeiDTrwAAAAJ&hl=en",
    linkedin: "https://www.linkedin.com/in/md-danial-dirar/",
    orcid: "https://orcid.org/0009-0002-4081-4175",
  },
} as const;

export const nav = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Research", href: "/research" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
] as const;
