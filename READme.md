# Nigerian News API

A REST API that scrapes Nigerian news websites and returns their latest articles in one consistent JSON shape.

Built with **TypeScript**, **Node.js**, **Express 5** and **Cheerio** (HTML/RSS parsing).

---

## Table of Contents

- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Article Shape](#article-shape)
- [Available Sources](#available-sources)
- [Project Structure](#project-structure)
- [Adding a New Source](#adding-a-new-source)
- [Roadmap](#roadmap)

---

## Quick Start

**Requirements:** Node.js `>= 22.12` (required by Puppeteer 25).

```bash
# 1. Clone and install
git clone <your-repo-url>
cd nigerian_news_api
npm install

# 2. Run in development (auto-restarts on changes)
npm run dev

# 3. Or build and run for production
npm run build
npm start
```

The server starts on `http://localhost:3001` by default.

| Script          | What it does                                  |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Runs `src/server.ts` with `tsx watch`         |
| `npm run build` | Compiles TypeScript to `dist/`                |
| `npm start`     | Runs the compiled app (`node dist/server.js`) |

---

## Configuration

| Variable | Default | Description                  |
| -------- | ------- | ---------------------------- |
| `PORT`   | `3001`  | Port the Express server uses |

---

## API Reference

**Base URL (local):** `http://localhost:3001`

### `GET /api/articles`

Scrapes every registered news source **live** and returns the combined results.

> ⚠️ Because scraping happens on each request, response time depends on how fast the news sites respond (each source has a 15-second timeout). Expect this endpoint to be slow until database-backed storage is added (see [Roadmap](#roadmap)).

**Request**

```http
GET /api/articles
```

No parameters, headers, or authentication are required.

**Response `200 OK`**

```json
{
  "articles": [
    {
      "title": "FG announces new fuel subsidy plan",
      "image": "https://punchng.com/wp-content/uploads/fuel.jpg",
      "url": "https://punchng.com/fg-announces-new-fuel-subsidy-plan",
      "publishedAt": "2026-09-21T08:15:00.000Z",
      "author": "Chidi Okafor",
      "sourceId": "punch"
    }
  ],
  "errors": [
    {
      "source": "premiumtimes",
      "error": "https://www.premiumtimesng.com/feed/ returned 503"
    }
  ]
}
```

| Field      | Type  | Description                                                       |
| ---------- | ----- | ----------------------------------------------------------------- |
| `articles` | array | All articles collected from sources that succeeded                |
| `errors`   | array | One entry per source that failed (empty when everything succeeds) |

A single failing source **never** breaks the request: the other sources still return their articles, and the failure is reported in `errors`.

**Response `500 Internal Server Error`**

```json
{ "message": "Scraping Failed" }
```

Returned only if the scraping process itself crashes unexpectedly.

---

## Article Shape

Every scraper, whatever the site's raw format, returns articles in this shape:

| Field         | Type             | Required         | Description                                      |
| ------------- | ---------------- | ---------------- | ------------------------------------------------ |
| `title`       | `string`         | ✅               | Headline                                         |
| `url`         | `string`         | ✅               | Absolute link to the full article                |
| `image`       | `string \| null` | ✅               | Absolute image URL, or `null` if none found      |
| `publishedAt` | `string \| null` | ❌               | ISO 8601 timestamp, when the source provides one |
| `author`      | `string \| null` | ❌               | Author name, when the source provides one        |
| `sourceId`    | `string`         | added by the API | Which newspaper/magazine/blog the article came from               |

`publishedAt` and `author` are only available from RSS/Atom sources. HTML-scraped sources currently return just `title`, `url`, and `image`.

---

## Available Sources

| `sourceId`     | Website       | Method   |
| -------------- | ------------- | -------- |
| `punch`        | Punch         | RSS feed |
| `premiumtimes` | Premium Times | RSS feed |
| `guardian`     | Guardian NG   | HTML     |

---

## Project Structure

```
src/
├── server.ts                  # Entry point: starts Express
├── routes/
│   └── articles.ts            # Defines /api/articles
├── services/
│   └── scraperServices.ts     # Runs all scrapers (5 at a time), collects results and errors
└── scrapers/
    ├── index.ts               # Source registry: add new sites here
    ├── generic.ts             # Reusable scrapers: scrapeRss() and scrapeHtml()
    └── types.ts               # NewsArticle, HtmlSelectors, SourceConfig
```

**How a request flows:**

```
GET /api/articles
      ↓
routes/articles.ts
      ↓
runAllScrapers()  → runs sources in batches of 5 with Promise.allSettled
      ↓
scrapers/index.ts → picks scrapeRss / scrapeHtml
      ↓
{ articles, errors }
```

---

## Adding a New Source

Open `src/scrapers/index.ts` and add an entry to the `sources` object. There are three types:

**1. RSS/Atom feed** (easiest, and gives you dates and authors)

```ts
vanguard: { type: 'rss', feedUrl: 'https://www.vanguardngr.com/feed/' },
```

**2. Plain HTML page** (no feed; articles must be visible in _View Page Source_)

```ts
examplesite: {
  type: 'html',
  url: 'https://example.com',
  selectors: { item: 'article', link: 'h2 a', image: 'img' },
},
```

- `item`: CSS selector for one article card
- `link`: selector for the headline link inside the card (its text becomes the title, its `href` the URL)
- `image`: _(optional)_ selector for the thumbnail

---

## Roadmap

These are planned but **not built yet**:

- [ ] **PostgreSQL storage (Neon):** save articles instead of scraping on every request
- [ ] **Scheduled scraping** with `node-cron`, so requests only read stored data
- [ ] **Deduplication** by article URL
- [ ] **Query parameters** on `/articles`: `?source=`, `?limit=`, `?page=`
- [ ] **API key authentication** (`X-API-Key` header) with self-serve key creation
- [ ] **Rate limiting** (in-memory leaky bucket) with `X-RateLimit-*` headers
- [ ] **Input validation** with Zod
- [ ] More sources...stay tuned

---

## License

ISC
