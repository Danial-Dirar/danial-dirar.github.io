/**
 * The local-AI bench, drawn as a ComfyUI-style node graph: two lanes that run
 * side by side — a private assistant built from open-weight LLMs, and an
 * image/video pipeline. Every claim traces to the CV, the Haifa Intelligence
 * README or the HiveMind project; no invented model sizes or scores.
 */

/** Wire types, coloured the way ComfyUI colours sockets. */
export type WireType = "MODEL" | "TEXT" | "IMAGE";

export type PipelineNode = {
  id: string;
  title: string;
  /** Small logos in the title bar (files in /public/logos). */
  logos?: { src: string; alt: string }[];
  /** ComfyUI-style widget rows: a name and its value. */
  widgets: { name: string; value: string }[];
  input?: WireType;
  output?: WireType;
  /** What the readout prints when the node is inspected. */
  notes: string[];
  /** A project on this site that shows the node at work. */
  link?: { label: string; href: string };
};

export type PipelineLane = {
  id: "llm" | "diffusion";
  label: string;
  nodes: PipelineNode[];
};

const qwen = { src: "/logos/qwen.svg", alt: "Qwen" };
const hf = { src: "/logos/huggingface.svg", alt: "Hugging Face" };
const ollama = { src: "/logos/ollama.svg", alt: "Ollama" };
const pytorch = { src: "/logos/pytorch.svg", alt: "PyTorch" };
const nvidia = { src: "/logos/nvidia.svg", alt: "NVIDIA" };

export const PIPELINE: PipelineLane[] = [
  {
    id: "llm",
    label: "local assistant",
    nodes: [
      {
        id: "load-llm",
        title: "Load Checkpoint",
        logos: [qwen, hf],
        widgets: [
          { name: "model", value: "open-weight LLM" },
          { name: "from", value: "Hugging Face" },
        ],
        output: "MODEL",
        notes: [
          "Starts from open weights — Qwen, Llama and friends — pulled from Hugging Face.",
          "Nothing leaves the machine: no cloud API between the data and the model.",
        ],
      },
      {
        id: "distill",
        title: "Distill",
        widgets: [
          { name: "teacher", value: "large model" },
          { name: "student", value: "fits one GPU" },
        ],
        input: "MODEL",
        output: "MODEL",
        notes: [
          "Knowledge distillation: a large teacher model trains a smaller student.",
          "The goal is the teacher's behaviour on hardware a business already owns.",
        ],
      },
      {
        id: "qlora",
        title: "QLoRA Fine-tune",
        logos: [pytorch],
        widgets: [
          { name: "data", value: "approved answers" },
          { name: "quant", value: "4-bit" },
        ],
        input: "MODEL",
        output: "MODEL",
        notes: [
          "Answers the user approves become training pairs for a QLoRA pass.",
          "So the assistant bends toward how its user actually works.",
        ],
        link: { label: "Haifa HiveMind", href: "/projects/haifa-hivemind" },
      },
      {
        id: "serve",
        title: "Ollama Serve + RAG",
        logos: [ollama],
        widgets: [
          { name: "rag", value: "ChromaDB" },
          { name: "network", value: "offline" },
        ],
        input: "MODEL",
        output: "TEXT",
        notes: [
          "Served locally with Ollama; retrieval over PDFs, DOCX, text and screenshots.",
          "Answers cite their sources, and On / Pause / Off keeps the GPU free.",
        ],
        link: { label: "Haifa HiveMind", href: "/projects/haifa-hivemind" },
      },
      {
        id: "answer",
        title: "Assistant",
        widgets: [],
        input: "TEXT",
        notes: [
          "The output: a private research assistant that runs entirely offline.",
          "Shipped as an Electron desktop app over a FastAPI core.",
        ],
        link: { label: "Haifa HiveMind", href: "/projects/haifa-hivemind" },
      },
    ],
  },
  {
    id: "diffusion",
    label: "image & video",
    nodes: [
      {
        id: "vl-prompt",
        title: "Image → Prompt",
        logos: [qwen],
        widgets: [
          { name: "model", value: "Qwen3-VL" },
          { name: "in", value: "reference image" },
        ],
        output: "TEXT",
        notes: [
          "Qwen3-VL reads a reference image and writes the prompt for it.",
          "A vision model doing the prompt engineering, locally.",
        ],
      },
      {
        id: "load-diffusion",
        title: "Load Model + LoRA",
        widgets: [
          { name: "model", value: "Krea2 · Wan" },
          { name: "lora", value: "custom, trained" },
        ],
        input: "TEXT",
        output: "MODEL",
        notes: [
          "Krea2 for stills, Wan and LTX for video, each with custom-trained LoRAs.",
          "Styles map to LoRAs and trigger words, so nobody has to see the jargon.",
        ],
      },
      {
        id: "sampler",
        title: "KSampler",
        logos: [nvidia],
        widgets: [
          { name: "steps", value: "8–16" },
          { name: "device", value: "RTX 3090, local" },
        ],
        input: "MODEL",
        output: "IMAGE",
        notes: [
          "Sampling runs on a local RTX 3090 — no paid cloud GPU.",
          "Valid resolutions, frame counts and CFG behaviour documented for repeatable output.",
        ],
        link: { label: "RTX 3090 48GB validator", href: "/projects/rtx-3090-48gb-validator" },
      },
      {
        id: "upscale",
        title: "Upscale",
        widgets: [{ name: "mode", value: "2-pass" }],
        input: "IMAGE",
        output: "IMAGE",
        notes: ["A fast generate pass, then a separate upscale for the final resolution."],
      },
      {
        id: "save",
        title: "Save Image",
        widgets: [],
        input: "IMAGE",
        notes: [
          "Real outputs from the pipeline: Krea2 with a different style LoRA each run.",
          "Built for advertising creatives at Haifa Intelligence.",
        ],
      },
    ],
  },
];

/** Real outputs from the Krea2 pipeline; each queued run shows the next. */
export const PIPELINE_OUTPUTS = [
  { src: "/ai/rainy-window-1.webp", alt: "A woman reading by a rain-streaked café window at night, in a soft illustrated style" },
  { src: "/ai/dark-brush-1.webp", alt: "A samurai under cherry blossoms, painted in black ink brush strokes" },
  { src: "/ai/retro-anime-1.webp", alt: "Two teenagers cycling along the sea at sunset, in a retro anime style" },
  { src: "/ai/neon-drip-1.webp", alt: "A phoenix exploding in splashes of neon paint" },
] as const;

/** The assistant's output line. */
export const PIPELINE_ANSWER = "Answer grounded in 3 of your files [1][2][3]. Nothing left the machine.";
