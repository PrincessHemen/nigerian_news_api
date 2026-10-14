import { scrapers } from "../scrapers/index.js"

export async function runAllScrapers() {
    const results = await Promise.allSettled(
        Object.entries(scrapers).map(async ([sourceId, scrape]) => {
            const articles = await scrape()
            return articles.map(article => ({ ...article, sourceId }))
        })
    )

    return results.flatMap(result => {
        if (result.status === 'fulfilled') {
            return result.value
        }
        console.error('Scraper failed:', result.reason)
        return []
    })
}