# Admin panel — browser-based blog composer on GitHub Pages

Date: 2026-08-10
Status: approved by owner

## Problem

The owner wants to publish blog posts (starting with an image post) from any
device, including a phone. Today the only composer is `studio/` — a localhost
Node server, unreachable from a phone.

## Constraint that shapes everything

The site is a static export (`output: "export"` in `next.config.ts`) hosted on
GitHub Pages. There is no server and there will not be one: the owner wants the
site to keep the `danial-dirar.github.io` root URL, and only GitHub Pages serves
that hostname.

Consequences, both accepted by the owner:

1. Any admin UI shipped with the site runs entirely in the browser.
2. Publishing must therefore go straight from the browser to the GitHub API,
   using a token the browser holds.

The owner was shown a server-backed alternative (a separate admin app on Vercel,
token held server-side) and chose the browser-only option to avoid a second
host.

## Auth: password derives the key, it does not get compared

A stored password hash compared client-side would be security theatre — the
comparison runs in downloadable JavaScript and is bypassed by editing it. So no
hash is stored and no comparison happens.

Instead the password *is* the key to the token:

- **Setup (once per device):** owner enters a password and a GitHub
  fine-grained PAT. PBKDF2-SHA256 (600,000 iterations, random 16-byte salt,
  WebCrypto) derives an AES-GCM key. The PAT is encrypted with it under a random
  12-byte IV. localStorage receives only `{v, salt, iv, ciphertext, iterations,
  owner, repo, branch}` — never the plaintext PAT.
- **Unlock:** password → derive key → attempt decrypt. AES-GCM's authentication
  tag is the check: a wrong password fails to decrypt, so no token, so no
  publish. There is no boolean to flip.
- **Auto-lock:** the decrypted token lives in React state only, and is dropped
  after 15 minutes idle or on reload.

Residual risk, accepted: the encrypted blob sits in localStorage on each device,
so an attacker with the device can attempt an offline dictionary attack against
it. Mitigations are the 600k-iteration KDF, a minimum password length enforced
at setup, and requiring the PAT to be fine-grained — scoped to this one repo
with `contents: write` and an expiry — so a compromise cannot reach other repos
or the account.

## Publishing: one commit per post

The Contents API writes one file per call, i.e. one commit per file, i.e. a
separate Pages rebuild per image. The Git Data API is used instead so a post and
all its images land in a single commit and trigger a single rebuild:

1. `GET /repos/{owner}/{repo}/git/ref/heads/{branch}` → head SHA
2. `POST .../git/blobs` per file (base64) → blob SHAs
3. `POST .../git/trees` with `base_tree` = head tree → new tree SHA
4. `POST .../git/commits` → commit SHA
5. `PATCH .../git/refs/heads/{branch}` → move branch

Deleting a post is the same flow with the file's tree entry set to `sha: null`.

## Files

- `content/blog/<slug>.mdx` — the post, frontmatter written the same way
  `studio/server.mjs` does it (JSON-quoted YAML scalars).
- `public/blog/<slug>/<name>.<ext>` — images.

Slug is derived from the title, matching `studio/server.mjs`'s `slugify`, with a
numeric suffix if the slug is already taken.

## Modules

| File | Responsibility |
| --- | --- |
| `app/admin/page.tsx` | Route shell; `robots: { index: false, follow: false }` |
| `components/admin/admin-app.tsx` | State machine: `setup` → `locked` → `ready`; idle auto-lock |
| `lib/admin/vault.ts` | PBKDF2 + AES-GCM; localStorage read/write; no React |
| `lib/admin/github.ts` | Git Data API client; `publishPost`, `deletePost`, `listPosts` |
| `lib/admin/slug.ts` | `slugify`, `uniqueSlug`, frontmatter builder |
| `components/admin/setup-form.tsx` | First run: password + PAT + repo |
| `components/admin/unlock-form.tsx` | Password only |
| `components/admin/composer.tsx` | Title, body, tags, excerpt, images, publish |
| `components/admin/post-list.tsx` | Existing posts + delete |

`lib/admin/vault.ts` and `lib/admin/github.ts` are plain modules with no React
imports, so they can be reasoned about and tested on their own.

## Also required

`MDXRemote` renders bare `<img>`, which does not get the deployment base path,
so inline images 404 while the site is still served from `/portfolio`. A
`components/mdx/mdx-image.tsx` override wrapping `lib/asset.ts`'s `asset()` is
passed to `MDXRemote` in `app/blog/[slug]/page.tsx`.

The cover image slot in `app/blog/[slug]/page.tsx` is `aspect-[16/8]` with
`object-cover`, which crops portrait images badly. The composer therefore
inserts images inline into the body by default; "set as cover" is opt-in.

## Out of scope

- Editing existing posts (delete + repost is enough for now).
- Any change to `studio/` — it keeps working from the PC, independently.
- Rich-text editing; the body stays Markdown.

## Owner action, separate from this work

The site is at `danial-dirar.github.io/portfolio` because the repo is a project
page. Renaming the repo to `danial-dirar.github.io` on GitHub makes it a user
site served at the root; `configure-pages` in the deploy workflow flips
`PAGES_BASE_PATH` to `""` automatically. No code change is needed.
