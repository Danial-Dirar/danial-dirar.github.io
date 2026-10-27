# danial-dirar.github.io

Portfolio, research and blog of **Md. Danial Dirar** — ML and software engineer,
and groundwater researcher working on Bangladesh's Barind Tract.

Live at **https://danial-dirar.github.io**.

## Stack

- Next.js 16 (App Router), static export (`output: "export"`) to GitHub Pages
- Tailwind CSS v4, shadcn/ui, Framer Motion, React `<ViewTransition>`
- Blog: MDX files in `content/blog/`, rendered with `next-mdx-remote` and Shiki

## Run it

```bash
npm install
npm run dev -- --webpack   # see handout notes: Turbopack dev can't fetch fonts on some machines
npm run build              # static site in out/
npm run studio             # local blog composer at http://127.0.0.1:4321
```

Pushing to `main` builds and deploys through `.github/workflows/deploy.yml`.

## Where things live

| Path | What |
| --- | --- |
| `lib/site.ts` | Name, email, socials, navigation |
| `lib/data/projects.ts` | Every project — copy, stack, links, cover image |
| `lib/data/research.ts`, `publications.ts` | Papers and ongoing research |
| `lib/data/experience.ts` | Work and education timeline (mirrors the CV) |
| `lib/data/field-map.ts` | Bangladesh outline, rivers, Barind Tract, field sites (generated from Natural Earth) |
| `lib/data/contours.ts` | Hero contour lines (generated) |
| `public/work/<slug>/cover.webp` | Project covers, 1600×1000 |
| `content/blog/*.mdx` | Blog posts; images in `public/blog/<slug>/` |
| `app/admin` | Browser-only composer for posting from any device |

## Adding a project

Add an entry to `lib/data/projects.ts` and a 1600×1000 `cover.webp` under
`public/work/<slug>/`. A blur placeholder can be made with:

```bash
magick public/work/<slug>/cover.webp -resize 20x -quality 40 webp:- | base64 -w0
```

Prefix the output with `data:image/webp;base64,`. Set `water: true` for water
and climate work so the card carries the droplet marker and appears under the
water filter.
