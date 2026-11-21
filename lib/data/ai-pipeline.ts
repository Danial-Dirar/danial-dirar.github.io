/**
 * The local-AI bench, laid out like a ComfyUI canvas: two groups of nodes
 * wired left to right — a private assistant built from open-weight LLMs, and
 * an image pipeline. Deliberately generic (no model names); the logos say
 * which tools the work runs on.
 *
 * Coordinates are canvas pixels at 100% zoom; the component scales the whole
 * canvas to fit, the way ComfyUI zooms.
 */

export type WireType = "MODEL" | "CLIP" | "CONDITIONING" | "LATENT" | "IMAGE" | "DOCS" | "TEXT";

export type Slot = { name: string; type: WireType };

export type CanvasNode = {
  id: string;
  title: string;
  x: number;
  y: number;
  w: number;
  logos?: { src: string; alt: string }[];
  inputs?: Slot[];
  outputs?: Slot[];
  widgets?: { name: string; value: string }[];
  /** Output nodes render their result below the widgets. */
  result?: "text" | "image";
  /** One plain sentence for the inspector. */
  note: string;
  link?: { label: string; href: string };
};

export type CanvasGroup = { id: string; title: string; x: number; y: number; w: number; h: number; tone: "violet" | "amber" };

export type CanvasEdge = { from: string; out: number; to: string; in: number };

export const CANVAS = { w: 1560, h: 628 };

/** Node geometry, shared by the renderer and the wire maths. */
export const NODE = { title: 28, pad: 8, row: 22 };

const qwen = { src: "/logos/qwen.svg", alt: "Qwen" };
const hf = { src: "/logos/huggingface.svg", alt: "Hugging Face" };
const ollama = { src: "/logos/ollama.svg", alt: "Ollama" };
const pytorch = { src: "/logos/pytorch.svg", alt: "PyTorch" };
const nvidia = { src: "/logos/nvidia.svg", alt: "NVIDIA" };

export const GROUPS: CanvasGroup[] = [
  { id: "llm", title: "local assistant", x: 16, y: 16, w: 1528, h: 262, tone: "violet" },
  { id: "image", title: "image & video", x: 16, y: 296, w: 1528, h: 316, tone: "amber" },
];

export const NODES: CanvasNode[] = [
  // ── local assistant ──
  {
    id: "llm-load",
    title: "Load Checkpoint",
    x: 40, y: 64, w: 240,
    logos: [qwen, hf],
    outputs: [{ name: "MODEL", type: "MODEL" }],
    widgets: [{ name: "ckpt", value: "open-weight LLM" }],
    note: "Starts from open weights pulled from Hugging Face. No cloud API anywhere in the loop.",
  },
  {
    id: "distill",
    title: "Distill",
    x: 340, y: 64, w: 240,
    inputs: [{ name: "teacher", type: "MODEL" }],
    outputs: [{ name: "MODEL", type: "MODEL" }],
    widgets: [{ name: "into", value: "smaller student" }],
    note: "Knowledge distillation: a large model teaches a smaller one that fits on a single GPU.",
  },
  {
    id: "qlora",
    title: "QLoRA Train",
    x: 640, y: 64, w: 240,
    logos: [pytorch],
    inputs: [{ name: "model", type: "MODEL" }],
    outputs: [{ name: "MODEL", type: "MODEL" }],
    widgets: [{ name: "data", value: "your feedback" }],
    note: "Fine-tunes on answers the user approved, so the model learns how its owner works.",
    link: { label: "Haifa HiveMind", href: "/projects/haifa-hivemind" },
  },
  {
    id: "docs",
    title: "Load Documents",
    x: 640, y: 182, w: 240,
    outputs: [{ name: "DOCS", type: "DOCS" }],
    widgets: [{ name: "from", value: "PDF, DOCX, images" }],
    note: "Your own files, indexed locally for retrieval.",
  },
  {
    id: "serve",
    title: "Ollama Serve + RAG",
    x: 940, y: 64, w: 260,
    logos: [ollama],
    inputs: [
      { name: "model", type: "MODEL" },
      { name: "context", type: "DOCS" },
    ],
    outputs: [{ name: "TEXT", type: "TEXT" }],
    widgets: [{ name: "network", value: "offline" }],
    note: "Served on the machine itself, answering from your documents with citations.",
    link: { label: "Haifa HiveMind", href: "/projects/haifa-hivemind" },
  },
  {
    id: "answer",
    title: "Assistant",
    x: 1270, y: 64, w: 250,
    inputs: [{ name: "text", type: "TEXT" }],
    result: "text",
    note: "The output: a private assistant that runs entirely on your own hardware.",
    link: { label: "Haifa HiveMind", href: "/projects/haifa-hivemind" },
  },

  // ── image & video ──
  {
    id: "img-load",
    title: "Load Checkpoint",
    x: 40, y: 344, w: 240,
    logos: [hf],
    outputs: [
      { name: "MODEL", type: "MODEL" },
      { name: "CLIP", type: "CLIP" },
    ],
    widgets: [{ name: "ckpt", value: "diffusion model" }],
    note: "An open diffusion model for stills or video, loaded locally.",
  },
  {
    id: "lora",
    title: "Load LoRA",
    x: 340, y: 344, w: 240,
    inputs: [{ name: "model", type: "MODEL" }],
    outputs: [{ name: "MODEL", type: "MODEL" }],
    widgets: [
      { name: "lora", value: "custom style" },
      { name: "strength", value: "0.85" },
    ],
    note: "Custom-trained LoRAs give each client a consistent look.",
  },
  {
    id: "prompt",
    title: "Prompt from Image",
    x: 340, y: 470, w: 240,
    logos: [qwen],
    inputs: [{ name: "clip", type: "CLIP" }],
    outputs: [{ name: "CONDITIONING", type: "CONDITIONING" }],
    widgets: [{ name: "from", value: "reference image" }],
    note: "A vision-language model reads a reference image and writes the prompt.",
  },
  {
    id: "sampler",
    title: "KSampler",
    x: 640, y: 344, w: 240,
    logos: [nvidia],
    inputs: [
      { name: "model", type: "MODEL" },
      { name: "positive", type: "CONDITIONING" },
    ],
    outputs: [{ name: "LATENT", type: "LATENT" }],
    widgets: [
      { name: "seed", value: "randomize" },
      { name: "sampler", value: "euler" },
    ],
    note: "Sampling runs on a local GPU, with no paid cloud in between.",
    link: { label: "RTX 3090 48GB validator", href: "/projects/rtx-3090-48gb-validator" },
  },
  {
    id: "decode",
    title: "VAE Decode + Upscale",
    x: 940, y: 344, w: 260,
    inputs: [{ name: "samples", type: "LATENT" }],
    outputs: [{ name: "IMAGE", type: "IMAGE" }],
    widgets: [{ name: "upscale", value: "2×" }],
    note: "A quick first pass, then a separate upscale for the final resolution.",
  },
  {
    id: "save",
    title: "Save Image",
    x: 1270, y: 324, w: 250,
    inputs: [{ name: "images", type: "IMAGE" }],
    result: "image",
    note: "Where the pipeline lands. The preview here shows example photos.",
  },
];

export const EDGES: CanvasEdge[] = [
  { from: "llm-load", out: 0, to: "distill", in: 0 },
  { from: "distill", out: 0, to: "qlora", in: 0 },
  { from: "qlora", out: 0, to: "serve", in: 0 },
  { from: "docs", out: 0, to: "serve", in: 1 },
  { from: "serve", out: 0, to: "answer", in: 0 },
  { from: "img-load", out: 0, to: "lora", in: 0 },
  { from: "img-load", out: 1, to: "prompt", in: 0 },
  { from: "lora", out: 0, to: "sampler", in: 0 },
  { from: "prompt", out: 0, to: "sampler", in: 1 },
  { from: "sampler", out: 0, to: "decode", in: 0 },
  { from: "decode", out: 0, to: "save", in: 0 },
];

/** Execution order, column by column, both groups together. */
export const RUN_ORDER = [
  "llm-load", "img-load",
  "distill", "lora", "prompt",
  "qlora", "docs", "sampler",
  "serve", "decode",
  "answer", "save",
];

/**
 * Example images for the Save Image preview — free photos from Unsplash (via
 * picsum.photos), credited in the UI. Each queued run shows the next.
 */
export const EXAMPLE_OUTPUTS = [
  { src: "/ai/photo-1015.webp", alt: "A river winding through a steep fjord", credit: "Alexey Topolyanskiy", href: "https://unsplash.com/photos/-oWyJoSqBRM" },
  { src: "/ai/photo-1039.webp", alt: "A waterfall pouring over a mossy green cliff", credit: "Andrew Coelho", href: "https://unsplash.com/photos/VB-w_3dnyvI" },
  { src: "/ai/photo-1050.webp", alt: "Sea stacks along a rocky coastline", credit: "Joseph Barrientos", href: "https://unsplash.com/photos/xcC5ozHk_N8" },
  { src: "/ai/photo-1044.webp", alt: "A person standing by a mountain river in mist", credit: "Steve Carter", href: "https://unsplash.com/photos/Ixp4YhCKZkI" },
] as const;

export const ASSISTANT_ANSWER = "Answered from 3 of your files [1][2][3]. Nothing left this machine.";

/** Height of a node, from its rows — the renderer and the wires agree on it. */
export function nodeHeight(n: CanvasNode): number {
  const io = Math.max(n.inputs?.length ?? 0, n.outputs?.length ?? 0);
  const rows = io + (n.widgets?.length ?? 0);
  const extra = n.result === "image" ? 216 : n.result === "text" ? 64 : 0;
  return NODE.title + NODE.pad * 2 + rows * NODE.row + extra;
}

/** Canvas position of a socket's centre. */
export function socketAt(n: CanvasNode, side: "in" | "out", index: number) {
  return {
    x: side === "in" ? n.x : n.x + n.w,
    y: n.y + NODE.title + NODE.pad + index * NODE.row + NODE.row / 2,
  };
}
