/**
 * Research output — peer-reviewed papers with abstracts, and ongoing work.
 * Kept separate from `publications.ts` (the compact list used on /about);
 * this is the richer source for the /research page.
 */

export type ResearchStatus = "published" | "ongoing";

export type ResearchAuthor = {
  name: string;
  /** Marks the site owner, rendered emphasized. */
  self?: boolean;
  /** e.g. "supervisor" — shown as a subtle parenthetical. */
  role?: string;
};

export type ResearchPaper = {
  id: string;
  title: string;
  status: ResearchStatus;
  authors: ResearchAuthor[];
  venue: string;
  year: number;
  /** e.g. "Vol. 16" — omitted for ongoing work. */
  volume?: string;
  doi?: string;
  /** Public code/repo link (e.g. GitHub) for ongoing work. */
  repo?: string;
  abstract: string;
  /** Short human-facing topic tags. */
  topics: string[];
  /**
   * Results as a before → after diff: "-" lines are the baseline, "+" lines
   * what the work found or achieved. Every figure is from the paper.
   */
  changes?: { sign: "-" | "+"; value: string; label: string }[];
};

const A = (name: string, self = false): ResearchAuthor => ({ name, self });
const Advisor = (name: string): ResearchAuthor => ({ name, role: "supervisor" });

export const research: ResearchPaper[] = [
  {
    id: "mar-potential-barind",
    title:
      "Engineering hydrological resilience: Quantitative assessment of managed aquifer recharge (MAR) potential utilizing advanced horizontal flow treatment in water stressed regions",
    status: "published",
    authors: [
      A("Md. Iquebal Hossain"),
      A("Md. Niamul Bari"),
      A("Md. Danial Dirar", true),
      A("Abdulla Al Kafy"),
      A("Hamad Ahmed Altuwaijri"),
      A("Tekalign Ketema Bahiru"),
    ],
    venue: "Applied Water Science",
    year: 2026,
    volume: "Vol. 16",
    doi: "10.1007/s13201-025-02665-1",
    topics: ["Managed aquifer recharge", "Hydrology", "GIS", "Bangladesh"],
    changes: [
      { sign: "-", value: "2–3 mm/day", label: "natural recharge through the clay aquitard" },
      { sign: "+", value: "10,000×", label: "faster infiltration through the treatment units" },
      { sign: "-", value: "50.61 Mm³", label: "surface runoff a year" },
      { sign: "+", value: "27.10 Mm³", label: "of it rechargeable a year (53.5%)" },
      { sign: "+", value: "3,315", label: "feasible MAR sites across the three areas" },
    ],
    abstract:
      "The water-stressed Barind Tract (BT) in northwest Bangladesh faces critical challenges in meeting irrigation and domestic water demands, with groundwater tables declining at rates of 0.09–0.39 m per year due to over-extraction and limited natural recharge through thick clay aquitards (21–39 m). This study evaluates the potential for managed aquifer recharge (MAR) across three districts of BT (Godagari, Niamatpur and Mohanpur) using integrated horizontal flow treatment units. We analyzed 376.68 km of re-excavated Kharies (natural canals) and 257.01 acres of Beels (water reservoirs), incorporating seventeen years (2005–2021) of groundwater monitoring data and nineteen years of rainfall analysis (2002–2020). Field-verified recharge rates of 29 L/min for Kharies and 162.7 L/min for Beels were used to calculate potential MAR installations using the rational formula. Our analysis identified 3,315 feasible MAR installation sites, capable of recharging 27.10 million m³ annually from 50.61 million m³ of surface runoff, achieving 53.5% utilization efficiency. The integrated treatment units overcame natural recharge limitations of 2–3 mm/day through thick clay aquitards, achieving a 10,000-fold improvement in infiltration rates. This assessment provides a scalable and replicable methodology for sustainable groundwater management strategies in water-stressed regions globally, with phased implementation offering a pathway to reverse groundwater depletion trends.",
  },
  {
    id: "mar-field-performance",
    title:
      "Design and field performance of an integrated horizontal flow treatment managed aquifer recharge system for groundwater rehabilitation in Bangladesh",
    status: "published",
    authors: [
      A("Md. Iquebal Hossain"),
      A("Md. Niamul Bari"),
      A("Md. Danial Dirar", true),
      A("Abdulla Al Kafy"),
      A("Hamad Ahmed Altuwaijri"),
      A("Tekalign Ketema Bahiru"),
    ],
    venue: "Applied Water Science",
    year: 2025,
    volume: "Vol. 15",
    doi: "10.1007/s13201-025-02588-x",
    topics: ["Managed aquifer recharge", "Water treatment", "Field study"],
    changes: [
      { sign: "-", value: "68 NTU", label: "turbidity of the incoming water" },
      { sign: "+", value: "2 NTU", label: "after the horizontal-flow unit (−97%)" },
      { sign: "+", value: "2.01 m", label: "water-table rise, 2015–2021" },
      { sign: "+", value: "96%", label: "of the recharge rate restored by backwashing" },
    ],
    abstract:
      "The Barind tract in northwest Bangladesh faces severe groundwater challenges due to excessive extraction and limited recharge capacity, primarily caused by its thick top clay layer and intensive agricultural water demand. This study develops and evaluates an innovative horizontal flow treatment unit integrated with Managed Aquifer Recharge (MAR). The developed system demonstrated exceptional treatment efficiency, achieving 97.06% turbidity reduction (from 68 to 2 NTU), 87.31% removal of total suspended solids, and significant bacterial contamination reduction of 81.82% (TC) and 93.75% (FC), while maintaining all chemical parameters within ECR 2023 drinking water standards. Under controlled conditions, the initial recharge rate achieved 168.06 lpm, while during monsoon flooding, natural condition recharge ranged from 154.11 to 167.38 lpm. The system demonstrated remarkable sustainability, with 96% recovery of the original recharge rate possible through backwashing and maintenance, showing only a minimal annual decline of 3.43 lpm/year. Long-term monitoring revealed a 2.01 m water table rise over seven years (2015–2021). The innovative aspects include a novel horizontal flow design that reduces clogging, integrated pre-treatment for suspended solids, and an efficient self-cleaning mechanism through backwashing. This study demonstrates that the integrated MAR-treatment system provides a sustainable solution for groundwater management in water-stressed regions, addressing both water quantity and quality challenges while ensuring long-term operational viability.",
  },
  {
    id: "plastic-degrading-metagenome",
    title:
      "Metagenomic profiling of plastic-degrading microbial communities in urban water bodies",
    status: "ongoing",
    authors: [
      A("Abrar"),
      A("Md. Danial Dirar", true),
      A("Saad Bin Sohan"),
      Advisor("Swakkhar Shatabda"),
    ],
    venue: "Undergraduate research · in progress",
    year: 2026,
    repo: "https://github.com/AbrarUI12/Metagenomic-Profiling-of-Plastic-Degrading-Microbial-Communities-in-Urban-Water-Bodies",
    topics: [
      "Metagenomics",
      "Bioinformatics",
      "Plastic degradation",
      "Machine learning",
    ],
    abstract:
      "Urban freshwater bodies accumulate large amounts of plastic pollution, yet the microbial genetic capacity to degrade these polymers in such environments remains poorly characterized. This ongoing study performs a conservative, thesis-grade screen for putative plastic-degrading enzymes in a polluted freshwater sediment metagenome (NCBI SRA accession SRR23872596), reporting genetic potential and homology-based inference rather than confirmed degradation. Sequencing reads are screened against a curated UniProtKB reference set of PETase-, MHETase-, cutinase-, AlkB-, and polyesterase-like enzymes using translated homology search (DIAMOND blastx) under strict thresholds (e-value ≤ 1e-5, ≥ 30% identity, ≥ 50 aa alignment length). Best-hit protein accessions are mapped to genus-level taxonomy to build genus–enzyme abundance matrices (raw and CPM-normalized), which are then clustered with k-means (k selected by silhouette) and organized into putative functional modules via a cosine-similarity genus network with Louvain community detection. The fully reproducible pipeline outputs enzyme–genus heatmaps, PCA and clustering figures, and modularity networks that together map which microbial genera co-carry plastic-degrading potential in urban water sediments. All results represent genetic potential only; homology-based inference cannot confirm enzymatic activity or plastisphere association.",
  },
  {
    id: "groundwater-level-prediction",
    title:
      "Deep learning for groundwater level prediction in the Barind Tract",
    status: "ongoing",
    authors: [A("Md. Danial Dirar", true)],
    venue: "Undergraduate thesis · in progress",
    year: 2026,
    topics: ["Machine learning", "Time-series", "Hydrology", "Deep learning"],
    abstract:
      "Groundwater is the primary source of irrigation in the Barind Tract of northwestern Bangladesh, a drought-prone region where limited natural recharge and intensive abstraction have contributed to persistent groundwater-level decline. Reliable groundwater level forecasting is therefore essential for sustainable water resource management, irrigation planning, and long-term policy decisions. This thesis proposes a comparative framework for groundwater level prediction in the Barind Tract using data-driven machine learning–based approaches. Monthly groundwater level observations will be compiled for selected monitoring locations, along with hydro-meteorological variables such as rainfall, geo-spatial data, evapotranspiration, tube-well count, soil properties, seasonal crop and satellite data where available. After pre-processing and constructing time-dependent predictors (e.g., lagged features and rolling statistics), multiple forecasting models will be implemented and evaluated, including seasonal statistical baselines (e.g., SARIMA), tree-based machine learning methods (e.g., Random Forest and gradient boosting), and deep learning architectures suited for temporal sequences (e.g., LSTM-based and hybrid CNN–LSTM models, and/or modern deep time-series models). Model performance will be assessed using standard forecasting metrics such as RMSE, MAE, and additional goodness-of-fit measures where applicable, with evaluation designed to preserve time order and support both short-term forecasting and longer-horizon projections. The expected outcome is a reproducible benchmarking study that identifies model strengths under Barind-specific hydro-climatic and data constraints and translates forecasting insights into decision-support implications for sustainable groundwater governance and adaptation strategies in the region.",
  },
];

export const doiUrl = (doi: string) => `https://doi.org/${doi}`;
