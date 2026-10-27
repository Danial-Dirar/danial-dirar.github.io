#!/usr/bin/env node
/**
 * Blog Studio — a local, Facebook-style composer for this git-based blog.
 *
 * Run with `npm run studio`. It serves a composer at http://127.0.0.1:4321
 * where you write a post and hit "Post". On publish it writes an .mdx file
 * into content/blog/ and (optionally) commits + pushes, which triggers the
 * GitHub Pages deploy workflow.
 *
 * It binds to localhost only and runs on your machine with your own git
 * credentials, so only you can post — no token in the browser, no backend.
 * Uses Node built-ins only; no extra dependencies.
 */
import http from "node:http";
import { readFile, readdir, writeFile, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const BLOG_DIR = path.join(ROOT, "content", "blog");
const PORT = 4321;
const HOST = "127.0.0.1";

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "post";

async function uniqueSlug(base) {
  let slug = base;
  let n = 2;
  while (existsSync(path.join(BLOG_DIR, `${slug}.mdx`))) slug = `${base}-${n++}`;
  return slug;
}

/**
 * Auto-excerpt — keep in step with deriveExcerpt in lib/admin/post-file.ts.
 * Drops Markdown syntax, keeps hyphenated words whole, ends on a word boundary.
 */
function deriveExcerpt(body, max = 160) {
  const text = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1);
  const end = cut.lastIndexOf(" ");
  const clipped = end > max * 0.6 ? cut.slice(0, end) : text.slice(0, max);
  return `${clipped.replace(/[\s,;:.—-]+$/, "")}…`;
}

/** Build YAML frontmatter using JSON-quoted scalars (valid YAML, safely escaped). */
function frontmatter({ title, date, tags, excerpt, cover }) {
  const lines = [
    `title: ${JSON.stringify(title)}`,
    `date: ${JSON.stringify(date)}`,
    `tags: [${tags.map((t) => JSON.stringify(t)).join(", ")}]`,
    `excerpt: ${JSON.stringify(excerpt)}`,
  ];
  if (cover) lines.push(`cover: ${JSON.stringify(cover)}`);
  return `---\n${lines.join("\n")}\n---\n`;
}

async function gitOps(args) {
  return (await run("git", args, { cwd: ROOT })).stdout.trim();
}

async function commitAndPush(files, message) {
  const log = [];
  try {
    await gitOps(["add", ...files]);
    await gitOps(["commit", "-m", message]);
    log.push("committed");
    await gitOps(["push"]);
    log.push("pushed — GitHub Actions will rebuild the site in ~1 min");
    return { ok: true, log };
  } catch (err) {
    return { ok: false, log, error: (err.stderr || err.message || "").trim() };
  }
}

async function listPosts() {
  if (!existsSync(BLOG_DIR)) return [];
  const files = (await readdir(BLOG_DIR)).filter((f) => /\.mdx?$/.test(f));
  const posts = [];
  for (const f of files) {
    const raw = await readFile(path.join(BLOG_DIR, f), "utf8");
    const m = raw.match(/title:\s*(.+)/);
    const d = raw.match(/date:\s*(.+)/);
    const strip = (v) => (v ? v.trim().replace(/^["']|["']$/g, "") : "");
    posts.push({
      slug: f.replace(/\.mdx?$/, ""),
      title: strip(m?.[1]) || f,
      date: strip(d?.[1]) || "",
    });
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 2_000_000) reject(new Error("body too large"));
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "content-type": "application/json" });
  res.end(body);
}

const ALLOWED_HOSTS = new Set([`127.0.0.1:${PORT}`, `localhost:${PORT}`]);
const ALLOWED_ORIGINS = new Set([`http://127.0.0.1:${PORT}`, `http://localhost:${PORT}`]);

/**
 * Guard state-changing (POST) requests against CSRF / DNS-rebinding. A page on
 * another site can send a cross-origin "simple" POST to this localhost server;
 * these checks reject anything that isn't our own composer talking to us.
 * Returns an error message to reject with, or null if the request is allowed.
 */
function rejectReason(req) {
  if (req.method !== "POST") return null;
  if (!ALLOWED_HOSTS.has(req.headers.host)) return "bad host";
  // Cross-origin form/text posts either send a foreign Origin or (for same-site
  // navigations) none — require our own Origin explicitly.
  if (!ALLOWED_ORIGINS.has(req.headers.origin)) return "bad origin";
  // application/json can't be sent cross-origin without a CORS preflight, which
  // we never grant — so requiring it blocks the text/plain "simple request" trick.
  if (!(req.headers["content-type"] || "").startsWith("application/json"))
    return "json only";
  return null;
}

const server = http.createServer(async (req, res) => {
  try {
    const reject = rejectReason(req);
    if (reject) return json(res, 403, { error: reject });

    if (req.method === "GET" && req.url === "/") {
      const html = await readFile(path.join(HERE, "index.html"), "utf8");
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return res.end(html);
    }

    if (req.method === "GET" && req.url === "/api/posts") {
      return json(res, 200, { posts: await listPosts() });
    }

    if (req.method === "POST" && req.url === "/api/publish") {
      const data = JSON.parse((await readBody(req)) || "{}");
      const title = (data.title || "").trim();
      const body = (data.body || "").trim();
      if (!title) return json(res, 400, { error: "Title is required." });
      if (!body) return json(res, 400, { error: "Write something first." });

      const tags = (data.tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const excerpt = (data.excerpt || "").trim() || deriveExcerpt(body);
      const date = new Date().toISOString().slice(0, 10);
      const slug = await uniqueSlug(slugify(title));
      const cover = (data.cover || "").trim();

      const file = path.join(BLOG_DIR, `${slug}.mdx`);
      await writeFile(file, `${frontmatter({ title, date, tags, excerpt, cover })}\n${body}\n`);

      let git = { skipped: true };
      if (data.commit) {
        git = await commitAndPush(
          [path.relative(ROOT, file)],
          `blog: ${title}`
        );
      }
      return json(res, 200, { ok: true, slug, saved: `content/blog/${slug}.mdx`, git });
    }

    if (req.method === "POST" && req.url === "/api/delete") {
      const data = JSON.parse((await readBody(req)) || "{}");
      const slug = (data.slug || "").replace(/[^a-z0-9-]/gi, "");
      if (!slug) return json(res, 400, { error: "Missing slug." });
      const file = path.join(BLOG_DIR, `${slug}.mdx`);
      if (!existsSync(file)) return json(res, 404, { error: "Post not found." });
      await unlink(file);

      let git = { skipped: true };
      if (data.commit) {
        git = await commitAndPush(
          [path.relative(ROOT, file)],
          `blog: remove ${slug}`
        );
      }
      return json(res, 200, { ok: true, git });
    }

    res.writeHead(404);
    res.end("not found");
  } catch (err) {
    json(res, 500, { error: err.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`\n  📝 Blog Studio running at http://${HOST}:${PORT}`);
  console.log(`     Compose a post, hit Post, and it goes live.\n`);
});
