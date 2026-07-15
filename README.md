# PitBlend

A free, browser-based BBQ rub builder. Design custom dry rubs by ingredient
percentage and get live flavor profile scoring, meat pairings, BBQ style
matching, batch weight calculations, and a printable recipe card - no
backend, no build step, no account required.

## Project structure

```text
pitblend/
|-- index.html          # the entire app (HTML, CSS, and JS in one file)
|-- ingredients.json    # ingredient library, flavor scores, densities, affiliate URLs
|-- recipes/            # base recipe library, as real JSON files
|   |-- index.json      # list of recipe files for the app to fetch
|   |-- base_starter.json
|   |-- base_texas_brisket.json
|   |-- base_sweet_rib.json
|   |-- base_spicy_chicken.json
|   |-- base_carolina_bbq.json
|   |-- base_salt_free_all_purpose.json
|   |-- base_salt_pepper_garlic.json
|   |-- base_seafood_spice.json
|   |-- base_slap_ya_mama_salt_free.json
|   |-- base_lemon_pepper_seasoning.json
|   |-- base_italian_seasoning.json
|   `-- base_greek_seasoning.json
`-- README.md
```

## How the ingredient loading works

`index.html` tries to `fetch('ingredients.json')` before the app renders.
That file is the source of truth for ingredient names, categories,
descriptions, density estimates, flavor scores, and affiliate fields.

Each ingredient has two affiliate fields:

```json
{
  "affiliateLink": null,
  "affiliateAddToCartLink": null
}
```

Leave both fields as `null` when there is no affiliate URL. When either field
contains an `http` or `https` URL, the Recipe Card shows a purchase button for
that ingredient. `affiliateAddToCartLink` is preferred and renders as
`Add to Cart`; otherwise `affiliateLink` renders as `Buy`.

If fetch is not available, the app falls back to the embedded ingredient seed
inside `index.html` so opening the file directly still works.

## How the recipe loading works

`index.html` tries to `fetch('recipes/index.json')` and then each file it
lists. On a real HTTP host (GitHub Pages, Netlify, any static server) this
succeeds, and those JSON files become the source of truth for the base
recipe library - edit or add a `.json` file here and it shows up in the app,
no code changes needed. Just add the new file's name to `recipes/index.json`
too.

If fetch is not available - e.g. the file is opened directly from disk
(`file://`), or it is running inside a sandboxed preview - the app silently
falls back to a small built-in copy of the same recipes embedded in
`index.html`, so it still works standalone.

User-submitted "Community Recipes" and private "Saved Blends" are stored at
runtime (via the Storage API when available, otherwise `localStorage`) - they
are not files in this repo.

## Running locally

Just open `index.html` in a browser. For `ingredients.json` and the `/recipes`
JSON files to load instead of falling back to the built-in copy, serve the
folder over HTTP rather than opening the file directly, e.g.:

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000/`.

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repo settings, enable **GitHub Pages** for the branch/folder you pushed to.
3. Your app will be live at `https://<your-username>.github.io/<repo-name>/`.

Before deploying, update the placeholder URLs in `index.html`'s `<head>`
(canonical link, Open Graph tags, Twitter Card tags, and the JSON-LD `url`
field) from `https://pitblend.app/` to your real domain, and add a 1200x630
`og-image.png` for social link previews.

## Adding a new base recipe

Add a new file to `recipes/`, e.g. `base_carolina_mustard.json`:

```json
{
  "id": "base_carolina_mustard",
  "name": "Carolina Mustard",
  "base": true,
  "author": "PitBlend",
  "notes": "",
  "createdAt": 4,
  "items": {
    "mustardPowder": 20,
    "kosherSalt": 20,
    "brownSugar": 15,
    "blackPepper": 15,
    "cayennePepper": 10,
    "paprika": 20
  }
}
```

Then add `"base_carolina_mustard.json"` to `recipes/index.json`.
