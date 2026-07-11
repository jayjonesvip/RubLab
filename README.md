# RubLab

A free, browser-based BBQ rub builder. Design custom dry rubs by ingredient
percentage and get live flavor profile scoring, meat pairings, BBQ style
matching, batch weight calculations, and a printable recipe card — no
backend, no build step, no account required.

## Project structure

```
rublab/
├── index.html          # the entire app (HTML, CSS, and JS in one file)
├── recipes/             # base recipe library, as real JSON files
│   ├── index.json       # list of recipe files for the app to fetch
│   ├── base_starter.json
│   ├── base_texas_brisket.json
│   ├── base_sweet_rib.json
│   └── base_spicy_chicken.json
└── README.md
```

## How the recipe loading works

`index.html` tries to `fetch('recipes/index.json')` and then each file it
lists. On a real HTTP host (GitHub Pages, Netlify, any static server) this
succeeds, and those JSON files become the source of truth for the base
recipe library — edit or add a `.json` file here and it shows up in the app,
no code changes needed. Just add the new file's name to `recipes/index.json`
too.

If fetch isn't available — e.g. the file is opened directly from disk
(`file://`), or it's running inside a sandboxed preview — the app silently
falls back to a small built-in copy of the same recipes embedded in
`index.html`, so it still works standalone.

User-submitted "Community Recipes" and private "Saved Blends" are stored at
runtime (via the Storage API when available, otherwise `localStorage`) —
they are not files in this repo.

## Running locally

Just open `index.html` in a browser. For the `/recipes` JSON files to load
(instead of falling back to the built-in copy), serve the folder over HTTP
rather than opening the file directly, e.g.:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000/`.

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repo settings, enable **GitHub Pages** for the branch/folder you pushed to.
3. Your app will be live at `https://<your-username>.github.io/<repo-name>/`.

Before deploying, update the placeholder URLs in `index.html`'s `<head>`
(canonical link, Open Graph tags, Twitter Card tags, and the JSON-LD
`url` field) from `https://rublab.app/` to your real domain, and add a
1200×630 `og-image.png` for social link previews.

## Adding a new base recipe

Add a new file to `recipes/`, e.g. `base_carolina_mustard.json`:

```json
{
  "id": "base_carolina_mustard",
  "name": "Carolina Mustard",
  "base": true,
  "author": "RubLab",
  "notes": "",
  "createdAt": 4,
  "items": { "mustardPowder": 20, "kosherSalt": 20, "brownSugar": 15, "blackPepper": 15, "cayennePepper": 10, "paprika": 20 }
}
```

Then add `"base_carolina_mustard.json"` to `recipes/index.json`.
