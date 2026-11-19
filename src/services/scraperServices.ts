import { scrapers } from '../scrapers/index.js'
import type { NewsArticle } from '../scrapers/types.js'

const CONCURRENCY = 5


// Runs every registered scraper in batches of CONCURRENCY (5) at a time
// ...so they don't all fire at once and overload the server
// Each batch runs in parallel with Promise.allSettled, so one failing scraper never stops the others.
// Successful results get a sourceId tag and are collected into `articles`; failures are logged and recorded (source + short message) in `errors`.
// Returns both, so the caller gets the data and a report of which sources broke.

export async function runAllScrapers() {
    const entries = Object.entries(scrapers)
    const articles: (NewsArticle & { sourceId: string })[] = []
    const errors: { source: string; error: string }[] = []

    for (let i = 0; i < entries.length; i += CONCURRENCY) {
        const chunk = entries.slice(i, i + CONCURRENCY)
        const results = await Promise.allSettled(
            chunk.map(async ([sourceId, scrape]) => {
                const items = await scrape()
                return items.map(a => ({ ...a, sourceId }))
            })
        )
        results.forEach((r, idx) => {
            if (r.status === 'fulfilled') {
                articles.push(...r.value)
            } else {
                const source = chunk[idx]![0]
                const error = String(r.reason?.message ?? r.reason).slice(0, 300)
                console.error(`Scraper failed [${source}]:`, error)
                errors.push({ source, error })
            }
        })
    }
    return { articles, errors }
}
