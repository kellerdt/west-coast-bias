# west-coast-bias

Website created via Nicepage: https://nicepage.com

Steps to deploy:
1. Export the HTML from that website and extract the contents into the git repository.
2. Commit the changes to GitHub.
3. Wait for GitHub pages to deploy the website!


Color Schemes:
#085a17 - Dark Green Text Color


## URL structure

Pages live in a directory named after their URL, as `index.html`, so the address bar
shows a clean path with no `.html` extension.

| URL | File | Page-specific CSS |
|-----|------|-------------------|
| `/` | `index.html` | `index.css` |
| `/league-documents/` | `league-documents/index.html` | `league-documents/style.css` |
| `/league-history/` | `league-history/index.html` | `league-history/style.css` |
| `/profiles/` | `profiles/index.html` | *(none — shared CSS only)* |

Shared assets stay at the repository root and are referenced with **root-absolute**
paths (`/nicepage.css`, `/index-improved.css`, `/images/...`) so a page works no
matter how deeply it is nested. Page-specific CSS sits next to its page and is
referenced relatively (`style.css`); the filename is arbitrary since nothing but
that page's `<link>` tag points at it.

The old `.html` addresses (`League-Documents.html`, `League-History.html`,
`Profiles.html`, `Homepage.html`) remain at the root as small `meta refresh`
redirect stubs so existing bookmarks and links keep working. They are marked
`noindex` and can be deleted once no inbound links rely on them.

**Adding a page:** create `<url-slug>/index.html`, link to it as `/<url-slug>/`,
add `<link rel="canonical" href="/<url-slug>/">` to its `<head>`, and copy the
four favicon `<link>` tags from an existing page.


## Favicon

`favicon.ico` sits at the repository root because browsers request `/favicon.ico`
whether or not a page links to it. The PNG icons live in `images/`.

| File | Purpose |
|------|---------|
| `favicon.ico` | Multi-resolution 16/32/48px fallback, auto-requested by browsers |
| `images/favicon-32.png` | Standard tab icon |
| `images/favicon-16.png` | Small tab icon |
| `images/apple-touch-icon.png` | 180px iOS home-screen icon |

All four are generated from `images/west_coast_bias_logo.png` — cropped to the
artwork's bounding box (the source has a wide transparent margin plus a faint
artifact below the island, both of which waste pixels at 16px), centered on a
square canvas with 4% padding, then downsampled. The Apple icon is flattened onto
white because iOS renders transparency as black.

To regenerate after changing the logo, run the generator from the repository root:

```bash
python _tools/make-favicon.py     # requires Pillow
```

`_tools/` is not deployed — Jekyll skips directories starting with `_`. (The same
caveat as `_docs/` applies: adding a `.nojekyll` file would stop Jekyll and make
it publicly reachable.)


## Image Naming Convention

### `images/` — Production directory (referenced by HTML/CSS)

Prefixes indicate the image's role on the page:

| Prefix | Usage |
|--------|-------|
| `hero-bg-` | Full-width background image for a page's hero section |
| `card-bg-` | Background image inside a content card |
| `profile-logo-` | Team logo image used on the Profiles page |
| `favicon-` | Browser tab icon at a specific pixel size |

**Current files:**

| File | Used in |
|------|---------|
| `hero-bg-main.jpg` | Hero section — index, history, profiles pages |
| `hero-bg-league-documents.jpg` | Hero section — league documents page |
| `card-bg-documents.png` | League Documents card background |
| `card-bg-history.png` | League History card background |
| `favicon-16.png` | Browser tab icon, 16px |
| `favicon-32.png` | Browser tab icon, 32px |
| `apple-touch-icon.png` | iOS home-screen icon, 180px (flattened onto white) |
| `homepage-section-image-1.png` | Legacy homepage section 2, left image |
| `homepage-section-image-2.png` | Legacy homepage section 2, right image |
| `profile-logo-placeholder.png` | Default team logo (used until team-specific logos are added) |
| `west_coast_bias_logo.png` | Site logo — nav bar and footer |
| `default-logo-unused.png` | Not currently referenced — retained for reference |

**Adding a team logo:**
1. Name the file using the pattern `profile-logo-<team-slug>.png` (e.g. `profile-logo-table-smashers.png`)
2. Place it in the `images/` folder
3. Update the relevant `<img src="...">` in `profiles/index.html`

### `customimages/` — Source/archive directory (not referenced by HTML/CSS)

Contains original and alternate-quality versions of production images. Files here mirror the naming of their `images/` counterparts where applicable.

| File | Notes |
|------|-------|
| `hero-bg-main.jpg` | Same file as production `hero-bg-main.jpg` (75% quality) |
| `hero-bg-league-documents.jpg` | Same file as production `hero-bg-league-documents.jpg` (100% quality) |
| `hero-bg-low-quality-unused.jpg` | 60% quality variant — not deployed |
| `card-bg-documents.png` | Same file as production |
| `card-bg-history.png` | Same file as production |