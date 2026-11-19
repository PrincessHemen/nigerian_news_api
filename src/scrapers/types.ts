// ---------- Types ----------

// An article on a news site
// The `publishedAt`, `image` and `author` fields are optional
// The `url` and `title` fields are required
export interface NewsArticle {
    title: string
    image: string | null
    url: string
    publishedAt?: string | null
    author?: string | null
}

// Selectors for an HTML page
// e.g. { item: 'article', link: 'h2 a', image: 'img' }
export interface HtmlSelectors {
    item: string          // the container of one article, e.g. 'article'
    link: string          // the link inside it; its text is the title, its href the URL
    image?: string        // e.g. 'img'
}

// Configuration for a news site
// e.g. { type: 'rss', feedUrl: 'https://punchng.com/feed/' }
export type SourceConfig =
    | { type: 'rss'; feedUrl: string }
    | { type: 'html'; url: string; selectors: HtmlSelectors }
    | { type: 'custom'; run: () => Promise<NewsArticle[]> }  // Puppeteer or anything else

