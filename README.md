# Agent Review Queue

A Senior Designer exercise: a case study plus a working prototype of a review queue for AI agent results, ranked by risk, with evidence beside every decision.

The site has five tabs: **Problem**, **Explorations**, **Prototype**, **Leverage** and **AI process**. The prototype runs from a small data spec (`ITEMS` near the top of the script in `index.html`). Edit it and the risk ratings, grouping, batching and rules all recompute.

## Prototype controls

| Key | Action |
| --- | --- |
| `J` / `K` | Move through the queue |
| `A` | Approve |
| `R` | Request changes |
| `X` | Select a safe result for batch approval |
| `E` | Take over |

## Run locally

It is a single static HTML file with no build step. Open `index.html` in a browser, or serve it:

```bash
npx serve .
```

## Deploy

Import the GitHub repo at [vercel.com/new](https://vercel.com/new). Vercel detects a static site with no framework; keep the defaults and deploy. Or from the CLI:

```bash
npx vercel --prod
```
