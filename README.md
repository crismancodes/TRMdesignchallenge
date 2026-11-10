# Agent Review Queue

A Senior Designer exercise: a case study plus a working prototype of a review queue for AI agent results, ranked by risk, with evidence beside every decision.

The case study (`index.html`) has five tabs: **Problem**, **Explorations**, **Prototype**, **Leverage** and **AI process**. The prototype itself is a separate full-screen page (`prototype.html`, served at `/prototype`), opened in a new tab from the Prototype tab.

| File | What it is |
| --- | --- |
| `index.html` | The case study |
| `prototype.html` | The full-screen prototype |
| `prototype.js` | Prototype data and behavior |
| `styles.css` | Shared Linear-style theme for both pages |
| `assets/prototype-preview.webp` | Preview image on the Prototype tab |

The prototype runs from a small data spec (`ITEMS` at the top of `prototype.js`). Edit it and the risk ratings, grouping, batching and rules all recompute. If you change how the prototype looks, retake the preview image too.

## Prototype controls

| Key | Action |
| --- | --- |
| `J` / `K` | Move through the queue |
| `A` | Approve |
| `R` | Request changes |
| `X` | Select a safe result for batch approval |
| `E` | Take over |

## Run locally

It is a static site with no build step. Open `index.html` in a browser, or serve it:

```bash
npx serve .
```

## Deploy

Import the GitHub repo at [vercel.com/new](https://vercel.com/new). Vercel detects a static site with no framework; keep the defaults and deploy. Or from the CLI:

```bash
npx vercel --prod
```
