const fs = require("fs");
const path = require("path");

const SITE_URL = "https://pitblend.com";
const ROOT = path.resolve(__dirname, "..");
const INGREDIENTS_PATH = path.join(ROOT, "ingredients.json");
const RECIPES_INDEX_PATH = path.join(ROOT, "recipes", "index.json");
const INGREDIENTS_DIR = path.join(ROOT, "ingredients");
const SITEMAP_PATH = path.join(ROOT, "sitemap.xml");

const FLAVOR_LABELS = {
  salt: "Salt",
  sweet: "Sweet",
  heat: "Heat",
  pepper: "Pepper",
  garlic: "Garlic",
  smoke: "Smoke",
  savory: "Savory",
  herb: "Herb",
  earthy: "Earthy",
  bark: "Bark",
  color: "Color"
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[ch]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function slugify(value) {
  return String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sentence(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : text + ".";
}

function recipeSlug(recipe) {
  return slugify(recipe.name || recipe.id || "recipe");
}

function loadRecipes() {
  if (!fs.existsSync(RECIPES_INDEX_PATH)) return [];
  const filenames = readJson(RECIPES_INDEX_PATH);
  return filenames
    .map(filename => {
      try {
        return readJson(path.join(ROOT, "recipes", filename));
      } catch (error) {
        return null;
      }
    })
    .filter(recipe => recipe && recipe.name && recipe.items);
}

function buildSlugMap(ingredients) {
  const used = new Set();
  const map = {};
  Object.entries(ingredients).forEach(([key, ingredient]) => {
    let baseSlug = slugify(ingredient.name || key);
    if (!baseSlug) baseSlug = slugify(key);
    let slug = baseSlug;
    if (used.has(slug)) slug = `${baseSlug}-${slugify(key)}`;
    used.add(slug);
    map[key] = slug;
  });
  return map;
}

function dominantFlavorText(flavor = {}) {
  const top = Object.entries(flavor)
    .filter(([key]) => key in FLAVOR_LABELS)
    .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
    .slice(0, 3)
    .filter(([, value]) => Number(value) > 0)
    .map(([key]) => FLAVOR_LABELS[key].toLowerCase());

  if (top.length === 0) return "It is mostly neutral in the flavor model.";
  if (top.length === 1) return `It mainly contributes ${top[0]}.`;
  return `It mainly contributes ${top.slice(0, -1).join(", ")} and ${top[top.length - 1]}.`;
}

function pageShell({ title, description, canonicalPath, body }) {
  const canonical = `${SITE_URL}${canonicalPath}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeAttr(description)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" type="image/png" sizes="512x512" href="/assets/pitblend-icon.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<style>
:root{color-scheme:dark;--bg:#121212;--panel:#1a1a1a;--panel2:#202020;--line:#35312d;--text:#f2eee9;--muted:#b8aaa0;--faint:#8f8278;--accent:#f05a28;--good:#d7b06a}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,Arial,sans-serif;line-height:1.5}
a{color:inherit}
.wrap{width:min(1040px,calc(100% - 32px));margin:0 auto}
.top{border-bottom:1px solid var(--line);background:#151515}
.top-inner{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px 0}
.brand{display:flex;align-items:center;gap:12px;text-decoration:none;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
.brand img{width:46px;height:46px;border-radius:50%}
.back{color:var(--muted);font-size:.9rem;text-decoration:none}
main{padding:42px 0 56px}
.eyebrow{color:var(--accent);text-transform:uppercase;letter-spacing:.12em;font-size:.74rem;font-weight:800;margin:0 0 10px}
h1{font-family:Georgia,serif;font-size:clamp(2.1rem,5vw,4rem);line-height:.98;margin:0 0 14px}
.lead{font-size:1.1rem;color:var(--muted);max-width:760px;margin:0 0 28px}
.grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:22px;align-items:start}
@media(max-width:820px){.grid{grid-template-columns:1fr}}
.card{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:22px}
.card h2{font-size:1rem;text-transform:uppercase;letter-spacing:.08em;margin:0 0 14px;color:var(--good)}
.meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:22px}
@media(max-width:560px){.meta{grid-template-columns:1fr}}
.meta div{background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:12px}
.label{display:block;color:var(--faint);font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;font-weight:800;margin-bottom:2px}
.bars{display:grid;gap:10px}
.bar{display:grid;grid-template-columns:78px 1fr 28px;gap:10px;align-items:center;color:var(--muted);font-size:.88rem}
.track{height:9px;border-radius:999px;background:#2d2a27;overflow:hidden}
.fill{height:100%;background:linear-gradient(90deg,#c7451b,var(--accent))}
.recipes{display:flex;flex-wrap:wrap;gap:8px}
.pill{display:inline-flex;border:1px solid var(--line);background:var(--panel2);border-radius:999px;padding:7px 10px;color:var(--muted);font-size:.84rem;text-decoration:none}
.btn{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--accent);background:var(--accent);color:#170d08;text-decoration:none;border-radius:6px;padding:10px 13px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;font-size:.78rem}
.muted{color:var(--muted)}
.disclosure{color:var(--faint);font-size:.78rem;margin-top:12px}
.list{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
.ingredient-link{display:block;text-decoration:none;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:14px}
.ingredient-link strong{display:block;margin-bottom:3px}
.ingredient-link span{color:var(--muted);font-size:.86rem}
</style>
</head>
<body>
<header class="top">
  <div class="wrap top-inner">
    <a class="brand" href="/"><img src="/assets/pitblend-icon.png" alt="">PitBlend</a>
    <a class="back" href="/">Blend Builder</a>
  </div>
</header>
${body}
</body>
</html>
`;
}

function ingredientPage(key, ingredient, slug, recipesUsingIngredient) {
  const productUrl = ingredient.affiliateAddToCartLink || ingredient.affiliateLink || "";
  const description = `${ingredient.name} flavor profile for seasoning blends. ${sentence(ingredient.desc)} Learn its category, flavor impact, and recipes that use it.`;
  const flavorRows = Object.entries(FLAVOR_LABELS).map(([keyName, label]) => {
    const value = Math.max(0, Math.min(10, Number(ingredient.flavor?.[keyName] || 0)));
    return `<div class="bar"><span>${escapeHtml(label)}</span><div class="track"><div class="fill" style="width:${value * 10}%"></div></div><strong>${value}</strong></div>`;
  }).join("\n");
  const recipeLinks = recipesUsingIngredient.length
    ? recipesUsingIngredient.map(recipe => `<span class="pill">${escapeHtml(recipe.name)}</span>`).join("\n")
    : `<p class="muted">No base recipes currently use this ingredient.</p>`;
  const productLink = productUrl
    ? `<a class="btn" href="${escapeAttr(productUrl)}" target="_blank" rel="noopener sponsored nofollow">View Product</a><p class="disclosure">Product links may be affiliate links.</p>`
    : `<p class="muted">No product link is set for this ingredient yet.</p>`;

  const body = `<main class="wrap">
  <p class="eyebrow">${escapeHtml(ingredient.category || "Ingredient")}</p>
  <h1>${escapeHtml(ingredient.name)}</h1>
  <p class="lead">${escapeHtml(sentence(ingredient.desc))} ${escapeHtml(dominantFlavorText(ingredient.flavor))}</p>
  <div class="grid">
    <section class="card">
      <h2>Flavor Profile</h2>
      <div class="bars">${flavorRows}</div>
    </section>
    <aside class="card">
      <h2>Ingredient Details</h2>
      <div class="meta">
        <div><span class="label">Category</span>${escapeHtml(ingredient.category || "Ingredient")}</div>
        <div><span class="label">Density</span>${escapeHtml(ingredient.density || "1")} g/tbsp</div>
      </div>
      ${productLink}
    </aside>
    <section class="card">
      <h2>Used In Base Recipes</h2>
      <div class="recipes">${recipeLinks}</div>
    </section>
  </div>
</main>`;

  return pageShell({
    title: `${ingredient.name} Flavor Profile for Seasoning Blends | PitBlend`,
    description,
    canonicalPath: `/ingredients/${slug}/`,
    body
  });
}

function ingredientIndexPage(ingredients, slugMap) {
  const links = Object.entries(ingredients)
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .map(([key, ingredient]) => `<a class="ingredient-link" href="/ingredients/${slugMap[key]}/"><strong>${escapeHtml(ingredient.name)}</strong><span>${escapeHtml(ingredient.category || "Ingredient")} - ${escapeHtml(ingredient.desc || "")}</span></a>`)
    .join("\n");
  const body = `<main class="wrap">
  <p class="eyebrow">Ingredient Library</p>
  <h1>Seasoning Ingredient Flavor Profiles</h1>
  <p class="lead">Browse PitBlend ingredients by flavor, category, and seasoning role. Each page is generated from the ingredient data used by the blend builder.</p>
  <section class="list">${links}</section>
</main>`;

  return pageShell({
    title: "Seasoning Ingredient Flavor Profiles | PitBlend",
    description: "Browse seasoning ingredients by flavor profile, category, description, and product links for building better BBQ rubs and spice blends.",
    canonicalPath: "/ingredients/",
    body
  });
}

function writeSitemap(slugMap) {
  const ingredientUrls = Object.values(slugMap)
    .sort()
    .map(slug => `  <url>
    <loc>${SITE_URL}/ingredients/${slug}/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`)
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/ingredients/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
${ingredientUrls}
</urlset>
`;
  fs.writeFileSync(SITEMAP_PATH, sitemap, "utf8");
}

function main() {
  const ingredients = readJson(INGREDIENTS_PATH);
  const recipes = loadRecipes();
  const slugMap = buildSlugMap(ingredients);

  fs.mkdirSync(INGREDIENTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(INGREDIENTS_DIR, "index.html"), ingredientIndexPage(ingredients, slugMap), "utf8");

  Object.entries(ingredients).forEach(([key, ingredient]) => {
    const slug = slugMap[key];
    const dir = path.join(INGREDIENTS_DIR, slug);
    const recipesUsingIngredient = recipes.filter(recipe => Object.prototype.hasOwnProperty.call(recipe.items, key));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), ingredientPage(key, ingredient, slug, recipesUsingIngredient), "utf8");
  });

  writeSitemap(slugMap);
  console.log(`Generated ${Object.keys(ingredients).length} ingredient pages and sitemap.xml`);
}

main();
