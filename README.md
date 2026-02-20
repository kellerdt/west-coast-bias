# west-coast-bias

Website created via Nicepage: https://nicepage.com

Steps to deploy:
1. Export the HTML from that website and extract the contents into the git repository.
2. Commit the changes to GitHub.
3. Wait for GitHub pages to deploy the website!


Color Schemes:
#085a17 - Dark Green Text Color


## Image Naming Convention

### `images/` — Production directory (referenced by HTML/CSS)

Prefixes indicate the image's role on the page:

| Prefix | Usage |
|--------|-------|
| `hero-bg-` | Full-width background image for a page's hero section |
| `card-bg-` | Background image inside a content card |
| `profile-logo-` | Team logo image used on the Profiles page |

**Current files:**

| File | Used in |
|------|---------|
| `hero-bg-main.jpg` | Hero section — index, history, profiles pages |
| `hero-bg-league-documents.jpg` | Hero section — league documents page |
| `card-bg-documents.png` | League Documents card background |
| `card-bg-history.png` | League History card background |
| `homepage-section-image-1.png` | Legacy homepage section 2, left image |
| `homepage-section-image-2.png` | Legacy homepage section 2, right image |
| `profile-logo-placeholder.png` | Default team logo (used until team-specific logos are added) |
| `west_coast_bias_logo.png` | Site logo — nav bar and footer |
| `default-logo-unused.png` | Not currently referenced — retained for reference |

**Adding a team logo:**
1. Name the file using the pattern `profile-logo-<team-slug>.png` (e.g. `profile-logo-table-smashers.png`)
2. Place it in the `images/` folder
3. Update the relevant `<img src="...">` in `Profiles.html`

### `customimages/` — Source/archive directory (not referenced by HTML/CSS)

Contains original and alternate-quality versions of production images. Files here mirror the naming of their `images/` counterparts where applicable.

| File | Notes |
|------|-------|
| `hero-bg-main.jpg` | Same file as production `hero-bg-main.jpg` (75% quality) |
| `hero-bg-league-documents.jpg` | Same file as production `hero-bg-league-documents.jpg` (100% quality) |
| `hero-bg-low-quality-unused.jpg` | 60% quality variant — not deployed |
| `card-bg-documents.png` | Same file as production |
| `card-bg-history.png` | Same file as production |