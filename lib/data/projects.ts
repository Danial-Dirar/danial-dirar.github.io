export type ProjectCategory = "AI" | "ML" | "Web" | "Mobile" | "Systems" | "Graphics";

export type ProjectImage = {
  src: string;
  blur: string;
  alt: string;
  /** CSS object-position when the default centre crop hides the subject. */
  position?: string;
  /** Required for third-party images (e.g. CC BY-SA photos). */
  credit?: { text: string; href: string };
};

export type Project = {
  slug: string;
  title: string;
  category: ProjectCategory;
  year: string;
  summary: string;
  description: string;
  tags: string[];
  stack: string[];
  repo?: string;
  /** Live/hosted build the visitor can open and try. */
  liveUrl?: string;
  /** Cover image for the card and the case-study hero. */
  image: ProjectImage;
  /** Architecture / pipeline diagram, shown full-width on the case study page. */
  diagram?: Omit<ProjectImage, "position" | "credit"> & { width: number; height: number };
  highlights?: { value: string; label: string }[];
  /** Who it was built for, when it was client work. */
  client?: string;
  /** Collaborators and supervisors. */
  credits?: string;
  institutions?: {
    label: string;
    items: { short: string; name: string; logo: string; url: string }[];
  };
  /** Water, climate or Barind field-data work — marked on the card. */
  water?: boolean;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "groundwater-prediction",
    title: "Groundwater Level Prediction",
    category: "ML",
    year: "2026",
    summary:
      "Undergraduate thesis at Brac University: monthly groundwater forecasts for 109 wells across Bangladesh's Barind Tract, checked against an independent monitoring network.",
    description:
      "Almost every dry-season rice field in the Barind Tract of northwestern Bangladesh is irrigated from groundwater, and the water table there has been falling for decades. This thesis builds a forecasting system for it. Records from the IWM/BWDB and BMDA monitoring networks, BMD's weather stations and BADC's irrigation censuses were reconciled into one validated dataset of 109 wells from 2005 to 2021, after a datum mismatch between the networks was found and repaired. A persistence baseline and six model families, from SARIMA and XGBoost to LSTM and N-BEATS, were compared under a strictly chronological, leakage-safe protocol at horizons of one to twelve months. When an audit showed the best-scoring models leaning on an autoregressive shortcut, the target was recast as the monthly change, which improved every model. The final system forecasts a month ahead to within 1.06 m, gives calibrated 90% prediction intervals, keeps part of its skill at wells it has never seen, and agrees with the independent BMDA network. It is built to support irrigation planning and managed aquifer recharge in one of the country's most water-stressed regions.",
    tags: ["Time-series", "Forecasting", "Hydrology"],
    stack: ["Python", "PyTorch", "XGBoost", "scikit-learn", "statsmodels", "GeoPandas"],
    image: {
      src: "/work/groundwater-prediction/cover.webp",
      blur: "data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAAAQBACdASoUAA0APu1iqU2ppaQiMAgBMB2JaACdH8ACglrOrSfeDnfkwAD+yX2WAiHnyiICRsFSpdiZ1q8PSAUP1xpiKxEH8xMZDZ8OspKj8sYLpQ23rKcJ/TY8QK7wkn07GUNFHZID7VE4J8kCDshQAAA=",
      position: "50% 55%",
      alt: "Women carrying sacks on their heads walk between green Boro rice fields in Naogaon, in the Barind Tract, with goats grazing and trees fading into the morning mist",
      credit: {
        text: "Photo: S.H. Tanim, Naogaon, CC BY-SA 4.0",
        href: "https://commons.wikimedia.org/wiki/File:The_Neon_Veil_of_Barind-_A_Twilight_Study_in_Naogaon.jpg",
      },
    },
    highlights: [
      { value: "1.06 m", label: "forecast error one month ahead (test RMSE)" },
      { value: "55%", label: "better than persistence, six months ahead" },
      { value: "0.92–0.97", label: "Nash–Sutcliffe efficiency" },
      { value: "109 wells", label: "monthly records, 2005–2021" },
    ],
    credits:
      "Md. Danial Dirar and Md. Raisul Islam, supervised by Dr. Mohammad Kaykobad. Department of Computer Science and Engineering, Brac University.",
    institutions: {
      label: "Built on data from",
      items: [
        { short: "IWM", name: "Institute of Water Modelling", logo: "/work/groundwater-prediction/partners/iwm.webp", url: "https://iwmbd.org" },
        { short: "BMDA", name: "Barind Multipurpose Development Authority", logo: "/work/groundwater-prediction/partners/bmda.webp", url: "https://bmda.gov.bd" },
        { short: "BMD", name: "Bangladesh Meteorological Department", logo: "/work/groundwater-prediction/partners/bmd.webp", url: "https://bmd.gov.bd" },
        { short: "BADC", name: "Bangladesh Agricultural Development Corporation", logo: "/work/groundwater-prediction/partners/badc.webp", url: "https://badc.gov.bd" },
        { short: "BWDB", name: "Bangladesh Water Development Board", logo: "/work/groundwater-prediction/partners/bwdb.webp", url: "https://www.bwdb.gov.bd" },
      ],
    },
    water: true,
    featured: true,
  },
  {
    slug: "haifa-hivemind",
    title: "Haifa HiveMind",
    category: "AI",
    year: "2026",
    summary:
      "A private, local AI research assistant — drop in your papers, ask grounded questions with citations, and it learns from your feedback. Runs entirely offline on your own machine.",
    description:
      "Built for a microbiology researcher who needed an assistant that never sends data to the cloud. HiveMind ingests PDFs, DOCX, text and images into a local knowledge base, answers questions grounded in those sources with citations, and reads screenshots with a vision model. When an answer misses, the user rejects it and the assistant rethinks; approved answers feed a QLoRA fine-tuning loop, so it adapts to how the researcher works. Chat history is searchable with a 30-day recycle bin, and simple On / Pause / Off power controls keep the GPU busy only when needed. Shipped as a cross-platform Electron desktop app over a FastAPI + React core — API-first, so mobile clients can connect over the LAN later.",
    tags: ["Local AI", "RAG", "Fine-tuning"],
    stack: ["Python", "FastAPI", "React", "Electron", "Ollama", "QLoRA"],
    repo: "https://github.com/Danial-Dirar/haifa-hivemind",
    liveUrl: "https://haifa-hivemind.vercel.app",
    image: {
      src: "/work/haifa-hivemind/cover.webp",
      blur: "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAACwAwCdASoUAA0APu1iqU2ppaQiMAgBMB2JYgC/OCHf1dU/T49oAAD+8M9ujQb09PUivJYbgknCaHjTEIeBvRCdBCpj4N8M6SUwAA==",
      alt: "Haifa HiveMind — the honeycomb mark on the Odyssus theme",
    },
    diagram: {
      src: "/work/haifa-hivemind/architecture.webp",
      width: 1800,
      height: 1373,
      alt: "Haifa HiveMind architecture — Electron/Mobile clients over a local FastAPI backend, ChromaDB + SQLite, and an Ollama model server, all on-device",
      blur: "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAAAQAwCdASoYABIAPu1ur1KppiQiqAgBMB2JZwDM0BbG3gAA/vAihCc3fU/g6pMSUgUob/n06yYZfk92gGIeMARAAAA=",
    },
    featured: true,
  },
  {
    slug: "rtx-3090-48gb-validator",
    title: "RTX 3090 48GB Mod Validator",
    category: "Systems",
    year: "2026",
    summary:
      "A workshop acceptance kit for RTX 3090 cards modded from 24 GB to 48 GB — it checks the card end to end and returns ACCEPT, REVIEW or REJECT before handover.",
    description:
      "A 48 GB RTX 3090 mod can boot and drive a display and still be bad: the driver reports the wrong memory size, CUDA sees less VRAM than it should, large allocations crash, or the OS logs NVIDIA, Xid, WHEA or PCIe errors. This suite is run at the workshop before a card is accepted. It confirms the card identifies as a 3090 with compute capability 8.6, that nvidia-smi and PyTorch both see about 49,152 MiB, writes to 92% of the 48 GB target by default, runs a matrix stress test, and captures PCIe link, VBIOS, driver, power and temperature. It then reads the Linux kernel log or the Windows event log for fresh errors and writes a Markdown and JSON report with a verdict, so every handover leaves evidence behind. Runners are provided for Linux, PowerShell and the Windows command prompt.",
    tags: ["GPU", "Hardware QA", "CUDA"],
    stack: ["Python", "PyTorch", "CUDA", "nvidia-smi", "Bash", "PowerShell"],
    repo: "https://github.com/Danial-Dirar/3090-48gb-vram-mod-validator",
    image: {
      src: "/work/rtx-3090-48gb-validator/cover.webp",
      blur: "data:image/webp;base64,UklGRnQAAABXRUJQVlA4IGgAAABwAwCdASoUAA0APu1iqU2ppaOiMAgBMB2JZQAAWnt7hTHJ+mAA/qoFB8tpMi4HAvDuWKIjqqtD/2aeEfxbo7KBPo37M79MPrr0ApcMF3+LXAkR4PPJCkcLTViWd/6UIJjXkiNufF/AAA==",
      alt: "An RTX 3090 board beside the words 3090 48-GB GPU Validator, with icons for VRAM, memory-stability and validation checks",
    },
    highlights: [
      { value: "49,152 MiB", label: "VRAM the card must report" },
      { value: "92%", label: "of 48 GB written in the default allocation test" },
      { value: "3", label: "verdicts — accept, review, reject" },
    ],
    featured: true,
  },
  {
    slug: "homeinn-interior",
    title: "Home Inn Interior Solution",
    category: "Web",
    year: "2026",
    summary:
      "The first website for a Dhaka interior-design firm with 73 corporate projects behind it — a marketing site, enquiry pipeline and admin panel in one monorepo.",
    description:
      "Home Inn has designed interiors, built custom furniture and delivered fit-outs across Bangladesh since 2015, but its only web presence was a Facebook page. The site's job is to make that track record legible to a prospective client within thirty seconds. It is a Turborepo monorepo: a Next.js marketing site with the firm's services, working areas, client logos and its own architectural renders, over a NestJS API on PostgreSQL through Prisma. Enquiries arrive through a rate-limited public endpoint that never echoes internal sales notes back, and staff manage projects, media, products and leads from an admin panel with role-guarded sessions. Every business fact on the site traces back to the company's own profile.",
    tags: ["Client work", "Full-stack", "Monorepo"],
    stack: ["Next.js", "NestJS", "Prisma", "PostgreSQL", "Turborepo", "pnpm"],
    repo: "https://github.com/Danial-Dirar/homeinn-interior",
    client: "Home Inn Interior Solution, Dhaka",
    image: {
      src: "/work/homeinn-interior/cover.webp",
      blur: "data:image/webp;base64,UklGRpIAAABXRUJQVlA4IIYAAADwAwCdASoUAA0APu1iqU2ppaQiMAgBMB2JQBOmUABtSAIG0GAIKXg4AP6+Rlxkbku9B9z5zIF4rDNvEJ/YjFEslctaoY9KDu85xn+cBRg9SQ5dkIwG6nyVeXJbp/PTdOl1/6aLtq3TTDEef1IdOAWlc2wm7IOjgCdzQIGwmgQNIDOlMgAAAA==",
      alt: "A Home Inn render of a double-height living room: a walnut media wall, a long sofa and floor-to-ceiling glass beside a brick screen",
    },
    featured: true,
  },
  {
    slug: "global-river-database",
    title: "GRD — Global River Database",
    category: "Web",
    year: "2025",
    summary:
      "A shared database of the world's rivers, with the geographical, environmental and financial data researchers need beside each one.",
    description:
      "GRD brings river records into one place and keeps the research data that belongs to each river right next to it: geography, environmental status and funding. Researchers add and update records, attach papers, discuss them in threads attached to each river, and admins manage who can do what, with a hierarchy-based verification method protecting the data's integrity. A Next.js interface sits on a NestJS API, with TypeORM over MySQL.",
    tags: ["Database", "Full-stack", "Research data"],
    stack: ["Next.js", "NestJS", "TypeORM", "MySQL"],
    repo: "https://github.com/Danial-Dirar/Global-River-Database",
    image: {
      src: "/work/global-river-database/cover.webp",
      blur: "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAACwAwCdASoUAAsAPu1iqU2ppaOiMAgBMB2JQBOgA2xzQBpVFJnQAAD+2njCrvs54jhn1ZmgBvdR1UJynGMSq9AcK+YAIKMmTiBhCAAA",
      alt: "Global River Database: the dashboard with sections for river records, research data, comments and user management, beside the line 'River data, organized.'",
      credit: {
        text: "Artwork: Tanzimul Karim",
        href: "https://tkarimdk.github.io/projects/global-river-database/",
      },
    },
    credits: "Built together with Tanzimul Karim.",
    water: true,
    featured: true,
  },
  {
    slug: "creditsense-ai",
    title: "CreditSense AI",
    category: "ML",
    year: "2025",
    summary:
      "A leak-free ML pipeline that scores loan eligibility — benchmarking five classifiers with stratified cross-validation to find the most reliable approve / reject model.",
    description:
      "CreditSense AI turns a raw loan dataset into a rigorous, reproducible model comparison. A scikit-learn Pipeline and ColumnTransformer do all the preparation inside cross-validation — dropping identifiers, imputing missing values (median for numbers, most-frequent for categories) and one-hot encoding — so no information ever leaks from validation folds into training. Five classifiers (KNN, Logistic Regression, Decision Tree, an MLP neural network and Random Forest) are each scored with 5-fold stratified cross-validation and out-of-fold predictions, using adaptive scaling (MinMax for KNN, standardisation for the rest). Every model is judged on accuracy, precision, recall, F1 and ROC-AUC against a majority-class baseline (~0.69), with confusion matrices and ROC curves saved as figures. A command-line project built to do the evaluation honestly rather than chase a single lucky train/test split.",
    tags: ["Classification", "Model benchmarking", "Credit risk"],
    stack: ["Python", "scikit-learn", "pandas", "NumPy", "Matplotlib", "Seaborn"],
    repo: "https://github.com/Danial-Dirar/CreditSense-AI",
    image: {
      src: "/work/creditsense-ai/cover.webp",
      blur: "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAABQAwCdASoUAA0APu1iqU2ppaOiMAgBMB2JQBYdhaD2yJE+gAD+74RewyuZetLExQcZgtI9CjT42pJkjJOUHlgx+NL9Sb92I7igAA==",
      alt: "CreditSense AI — a gold classical bank emblem on a deep navy field",
    },
    diagram: {
      src: "/work/creditsense-ai/architecture.webp",
      width: 1800,
      height: 1150,
      alt: "CreditSense AI pipeline — dataset to preprocessing to 5-fold stratified cross-validation across five classifiers, then evaluation metrics and output figures",
      blur: "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAABwAwCdASoYAA8APu1iqU2ppaOiMAgBMB2JYwCdACHfw5iw9gAA/uy6JCT75vDAfttlok/tIhB4x+N/bDrVxumDcSIAAA==",
    },
    featured: true,
  },
  {
    slug: "music-generation",
    title: "Unsupervised Music Generation",
    category: "ML",
    year: "2026",
    summary:
      "A neural network that learns piano music from raw MIDI and composes new passages, without labels.",
    description:
      "An unsupervised deep-learning project (CSE425) that learns musical structure from the MAESTRO piano dataset and writes new music. MIDI files become 88-key piano rolls cut into fixed-length windows; an LSTM autoencoder learns to rebuild them and a sequence VAE samples new passages from its latent space, with a transformer added later for longer pieces. The output is judged on pitch-histogram distance, rhythm diversity and repetition, and the write-up is candid about where the samples stay conservative.",
    tags: ["Generative", "Neural nets", "Audio"],
    stack: ["Python", "PyTorch", "pretty_midi"],
    repo: "https://github.com/Danial-Dirar/music-generation-unsupervised",
    image: {
      src: "/work/music-generation/cover.webp",
      blur: "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADwAwCdASoUAA0APu1iqU2ppaOiMAgBMB2JQBOmUABp1nan5azMy3OAAP7wx51KzgtcCm76+1SEYQbUTGtBpXVNJRTnkKRNAAA=",
      alt: "A piano roll of a passage the model composed: a melody that dips and climbs back, drawn as glowing violet notes",
    },
  },
  {
    slug: "providing-it-services",
    title: "Providing IT Services",
    category: "Web",
    year: "2026",
    summary:
      "A server-rendered corporate site for a Brooklyn IT firm, with a hairline globe of its delivery routes and a widget that shows how your working day overlaps New York's.",
    description:
      "A marketing site for a technology-services firm in Brooklyn, New York, built on NestJS with Handlebars templates, hand-written CSS and vanilla ES modules — no client framework and no front-end build step. Every piece of editorial content lives in one service, so adding a service creates its page, footer link, sitemap entry and contact-form option at once. The hero is a canvas globe that rocks rather than spins, keeping New York on the visible face while great-circle routes run out to each delivery hub. A coverage band reads the visitor's own time zone in the browser and shows how much of their day overlaps New York's office hours. Helmet with a fully first-party CSP, rate limiting, strict validation and a honeypot guard the one endpoint that accepts input.",
    tags: ["Client work", "Server-rendered", "Canvas"],
    stack: ["NestJS", "TypeScript", "Handlebars", "Canvas", "CSS"],
    repo: "https://github.com/Danial-Dirar/providing-it-services",
    liveUrl: "https://providing-it-services.vercel.app",
    client: "Providing IT Services, Brooklyn, New York",
    image: {
      src: "/work/providing-it-services/cover.webp",
      blur: "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADQAwCdASoUAA0APu1iqk2ppaQiMAgBMB2JZQC/OCHhoS3PyP1oKcAA/vHT8ck2vBkmmFlUoVpzjIY24tpeOM0vurX8pbhK1swJCXyxYAAAAA==",
      alt: "The Providing IT Services logo — a cyan and navy globe mark beside the wordmark, Technology, Consulting, Support",
    },
  },
  {
    slug: "haifa-cosmetics",
    title: "Haifa Cosmetics",
    category: "Web",
    year: "2026",
    summary:
      "An editorial storefront for beauty products imported to Bangladesh — shade selector, ⌘K search, a persisted cart, and checkout by bKash, cash or card.",
    description:
      "A storefront designed to feel like walking a luxury counter: porcelain white, plum-black ink and a signature rouge, set in Fraunces and Manrope. The Next.js app has category and shop pages with filtering and sorting, product pages with a shade selector, a persisted cart drawer, ⌘K search and accounts with order history; a NestJS API handles JWT auth, orders and the catalogue. Products render as shade-tinted SVG vessels so the shop never shows a broken image, and checkout still completes locally when the API is offline, so the demo never breaks.",
    tags: ["E-commerce", "Full-stack", "Motion"],
    stack: ["Next.js", "NestJS", "Tailwind CSS", "Framer Motion", "JWT"],
    repo: "https://github.com/Danial-Dirar/haifa-cosmetics",
    liveUrl: "https://haifa-cosmetics.vercel.app",
    image: {
      src: "/work/haifa-cosmetics/cover.webp",
      blur: "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAABQAwCdASoUAA0APu1iqU2ppaOmMAgBMB2JZwDCgCHgDVqugAD+78KKazo9LgiN+Gej6vsRFIvzHQNqzsoLeqeXIAA=",
      alt: "A rouge serum bottle, a lipstick and an open compact on a porcelain backdrop, with notes for shade selector, search and cart",
    },
  },
  {
    slug: "dishdash",
    title: "DishDash",
    category: "Mobile",
    year: "2025",
    summary:
      "A two-sided food-offers marketplace — restaurants post live deals, and hungry users discover the tastiest ones near them on a realtime map.",
    description:
      "A two-sided Flutter marketplace that connects restaurants with hungry customers through live, location-based deals. Restaurant owners post and schedule offers — images, pricing, discounts and promo codes — then track views, saves and shares on a per-offer analytics dashboard. Food lovers browse a realtime offers feed with search and an OpenStreetMap view, save deals to personal collections, and share them natively; guests can explore without an account. Role-based auth routes each user to the right experience, with persistent login, password reset and full dark-mode support. Built Firebase-only — Cloud Firestore and Firebase Auth, no custom server — for a fast, native feel across Android, iOS and web.",
    tags: ["Marketplace", "Realtime", "Location"],
    stack: ["Flutter", "Firebase", "Firestore", "OpenStreetMap", "Dart"],
    repo: "https://github.com/Danial-Dirar/DishDash",
    liveUrl: "https://dish-dash-silk.vercel.app",
    image: {
      src: "/work/dishdash/cover.webp",
      blur: "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAABwAwCdASoUAA0APu1iqU2ppaOiMAgBMB2JagCdLoAANgbxCAAA/FqhOKslHyBODYS67KmhiXxzGGHaL/8Vn1jMTLlG/VwWo6NitnSJ7NO2GuLX9AA=",
      alt: "DishDash — a location pin with a fork and spoon over floating deal chips, on the app's orange brand gradient",
    },
    diagram: {
      src: "/work/dishdash/architecture.webp",
      width: 2360,
      height: 1800,
      alt: "DishDash architecture — a single Flutter app serving both restaurant owners and food lovers over a Firebase-only backend (Auth + Cloud Firestore), with OpenStreetMap for maps and device plugins for GPS, camera and native share",
      blur: "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADQAwCdASoYABIAPu1wsFIppiSiqAgBMB2JZwDM0BEOSIPgXSUmXUAA/uPmwu4dIQ4kT0i8Lj5M25VahuiTABV4gdQu5bzKxhzIK8LMbatJZ9+9AAA=",
    },
  },
  {
    slug: "shipsight-ai",
    title: "ShipSight AI",
    category: "ML",
    year: "2025",
    summary: "Predicts whether an online order will reach the customer on time.",
    description:
      "A model that reads an order's details and predicts whether it will arrive on time, so a logistics team can spot the shipments likely to run late. It learns from e-commerce shipping records (warehouse block, shipment mode, customer-care calls, ratings, product cost and importance, prior purchases, discount and weight) and compares four classifiers, k-nearest neighbours, logistic regression, a decision tree and a neural network, on accuracy, precision, recall and ROC-AUC.",
    tags: ["Logistics", "Prediction", "Operations"],
    stack: ["Python", "pandas", "scikit-learn", "Matplotlib", "Seaborn"],
    repo: "https://github.com/Danial-Dirar/ShipSight-AI",
    image: {
      src: "/work/shipsight-ai/cover.webp",
      blur: "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAADQAwCdASoUAA0APu1iqU2ppaQiMAgBMB2JZACsACHgRzPURH0u4AAA/uw9rzC7SiLQ8r8sJSp8Dz4bi26vgp/kc8A0dntfYD3VrKN2jT+hHacvnAtGw9AA",
      alt: "A parcel with an on-time clock, surrounded by order details the model reads: discount offered, weight in grams, mode of shipment",
    },
  },
  {
    slug: "distributed-ml",
    title: "Distributed ML System",
    category: "Systems",
    year: "2025",
    summary:
      "A resource-aware master–worker system that trains temperature-prediction models for Godagari, in the Barind Tract, across several machines.",
    description:
      "A CSE449 distributed-systems project. A master node loads historical temperature records from GodaGari–Amtoli in Rajshahi and hands training data to worker machines over sockets: more to the ones with room to spare, less to the busy ones, going by the CPU cores, memory and live load each worker reports. Workers train regression models (linear regression, random forest, SVR) on their share and send them back, and the master combines them, evaluates the result and plots it.",
    tags: ["Distributed", "Load balancing", "Climate data"],
    stack: ["Python", "Sockets", "psutil", "scikit-learn", "pandas"],
    repo: "https://github.com/Danial-Dirar/CSE449_distributed_ml_system",
    image: {
      src: "/work/distributed-ml/cover.webp",
      blur: "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAAAwAwCdASoUAA0APu1iqU2ppaOiMAgBMB2JQAALfhx/3BFwAP7w00GwBO70l/LBCM+o/KfyzQNv2vkIDAfXbwsa2jgAAA==",
      alt: "A master node handing work to four worker machines, sending more to the ones with the lightest load",
    },
    water: true,
  },
  {
    slug: "haifa-os",
    title: "Haifa OS",
    category: "Systems",
    year: "2026",
    summary:
      "An Arch-based Linux distribution aimed at a smooth first boot for gamers, developers and people leaving macOS.",
    description:
      "Haifa OS is an Arch-based distribution built to work well out of the box. The repository holds the archiso profile that builds the live ISO, a branded Calamares installer, the distribution's own packages — branding, defaults and meta-packages — and the artwork, with a pacman repository generated from them. Policy for default apps, packaging and releases is written down alongside the build.",
    tags: ["Linux", "Distribution", "Packaging"],
    stack: ["Arch Linux", "archiso", "Calamares", "pacman", "Shell"],
    repo: "https://github.com/Danial-Dirar/haifa-os",
    image: {
      src: "/work/haifa-os/cover.webp",
      blur: "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAAAQAwCdASoUAA0APu1iqU2ppaQiMAgBMB2JZwAAW+wadBgA/vDMfFUHG5RGHJ28nS5GjRbdWNAAAA==",
      alt: "The Haifa OS mark — a rose ring around the word Haifa — with notes for the archiso profile, the Calamares installer and pacman",
    },
  },
  {
    slug: "steam-store-bd",
    title: "Steam Store Bangladesh",
    category: "Web",
    year: "2021",
    summary:
      "The storefront for Steam Store Bangladesh, the digital-games shop Danial founded and ran for ten years — with an admin panel for the catalogue.",
    description:
      "Steam Store Bangladesh sold digital games online from 2016 to 2026, with Danial running its operations, PR and customer communication. This is its storefront, Daniel's Dungeon: a Vite build in vanilla JavaScript and CSS with a themeable design built on CSS variables, and an admin panel where products are added, edited and removed. Product data persists in local storage, which stands in for a backend.",
    tags: ["Own business", "Storefront", "Admin panel"],
    stack: ["Vite", "JavaScript", "CSS", "localStorage"],
    repo: "https://github.com/Danial-Dirar/steam_store_bd",
    liveUrl: "https://steam-store-bd.netlify.app",
    image: {
      src: "/work/steam-store-bd/cover.webp",
      blur: "data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAABwBACdASoUAA0APu1kqU2ppaQiMAgBMB2JYgCdIJPDA2Zzxci7xm62ki3egAD+9CnEW3iCNpCsPqhI3SnEaPckC7h1gxdfF5Gltr8HRZhq5Ztev+eud86JrDah/nJ/f+/oXfomwplN/JqvBX4pRriwAAA=",
      alt: "The Steam Store Bangladesh logo over a neon-lit desk of retro consoles and computers",
    },
  },
  {
    slug: "signal-sweep",
    title: "Signal Sweep",
    category: "Graphics",
    year: "2024",
    summary: "A 3D radar that shows the Bluetooth devices around you, live.",
    description:
      "A computer-graphics project (CSE423) that scans for nearby Bluetooth devices and plots each one on a sweeping 3D radar drawn in OpenGL, labelled with its name and signal strength, with play and stop controls and several colour themes.",
    tags: ["OpenGL", "Signals", "Visualization"],
    stack: ["Python", "OpenGL", "bleak"],
    repo: "https://github.com/Danial-Dirar/Project-Signal-Sweep",
    image: {
      src: "/work/signal-sweep/cover.webp",
      blur: "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAADwAgCdASoUAA0APu1iqU2ppaOiMAgBMB2JZQCsAC0kAAD+8JzFzKgfRfBBIRfoB/c72PcCnnm6+Sk3aXDqItueoAA=",
      alt: "Signal Sweep's radar window: a sweeping blue radar with nearby Bluetooth devices marked by name and signal strength",
    },
  },
  {
    slug: "cse423-graphics",
    title: "OpenGL Lab: Rainfall House & Bubble Shooter",
    category: "Graphics",
    year: "2025",
    summary:
      "Two CSE423 programs drawn from raw OpenGL primitives — rain falling on a house, and a playable bubble shooter.",
    description:
      "Course work for CSE423 Computer Graphics at BRAC University, written in Python with PyOpenGL and GLUT. Rainfall House draws a house from lines and rectangles and animates raindrops falling onto its roof. Bubble Shooter is a small arcade game: a rocket moved with A and D fires at bubbles falling from above, with circles rasterised by the midpoint algorithm, collision detection, a running score, a game-over state and on-screen pause, restart and exit buttons, all driven by a GLUT timer.",
    tags: ["OpenGL", "Rasterisation", "Games"],
    stack: ["Python", "PyOpenGL", "GLUT"],
    repo: "https://github.com/Danial-Dirar/CSE423-Computer-Graphics-Projects",
    image: {
      src: "/work/cse423-graphics/cover.webp",
      blur: "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADwAwCdASoUAA0APu1kqU2ppaOiMAgBMB2JYwCw7CHfcC8N3s6WwqogAP7uhu9UWT6vUxEBRKUoqBnvhtj2O9WUb1oL/TOSreS0T36b4AA=",
      alt: "A house drawn in blue lines under slanted rain, beside a stack of coloured bubbles and a shooter aiming up at them",
    },
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

/** The projects either side of `slug`, wrapping around, for case-study paging. */
export function getAdjacentProjects(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  const n = projects.length;
  return {
    previous: projects[(i - 1 + n) % n],
    next: projects[(i + 1) % n],
  };
}
