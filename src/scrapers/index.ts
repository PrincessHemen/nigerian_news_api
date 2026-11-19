import { scrapeRss, scrapeHtml } from './generic.js'
import type { NewsArticle, SourceConfig } from './types.js'

const sources: Record<string, SourceConfig> = {
    // Site with a feed 
    punch: { type: 'rss', feedUrl: 'https://punchng.com/feed/' },
    premiumtimes: { type: 'rss', feedUrl: 'https://www.premiumtimesng.com/feed/' },

    // Site with no feed, articles present in raw HTML (fill in the selectors from DevTools)
    // examplesite: {
    //     type: 'html',
    //     url: 'https://example.com',
    //     selectors: { item: 'article', link: 'h2 a', image: 'img’}
    // },

    // Site that needs a real browser 
    // jssite: { type: 'custom', run: () => scraperJsSite() },
}

export const scrapers: Record<string, () => Promise<NewsArticle[]>> = Object.fromEntries(
    Object.entries(sources).map(([id, cfg]) => [
        id,
        () => {
            switch (cfg.type) {
                case 'rss': return scrapeRss(cfg.feedUrl)
                case 'html': return scrapeHtml(cfg.url, cfg.selectors)
                case 'custom': return cfg.run()
            }
        }
    ])
)
