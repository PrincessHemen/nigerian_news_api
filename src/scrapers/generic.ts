import * as cheerio from 'cheerio'
import type { HtmlSelectors, NewsArticle } from './types.js'

// Downloads a URL and returns its body as text, cancelling the request if it takes longer than 15s and throwing an error; the timer is always cleared.
async function fetchText(url: string, accept: string): Promise<string> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    try {
        const res = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NigerianNewsAPI/1.0)', Accept: accept }
        })
        if (!res.ok) throw new Error(`${url} returned ${res.status}`)
        return await res.text()
    } finally {
        clearTimeout(timer)
    }
}

// Converts a possibly-relative link (e.g. "/news/story-1") into a full URL using `base`, returning null if it's missing, a data: placeholder, malformed, or not http/https (blocks javascript:, mailto:, etc.).
function absolute(href: string | undefined, base: string): string | null {
    if (!href || href.startsWith('data:')) return null
    try {
        const u = new URL(href, base)
        return ['http:', 'https:'].includes(u.protocol) ? u.href : null
    } catch {
        return null
    }
}

// Finds the first <img> in an HTML snippet (e.g. an RSS <description>) and returns its absolute URL.
function imageFromHtml(html: string, base: string): string | null {
    if (!html) return null
    const img = cheerio.load(html)('img').first()
    return absolute(img.attr('src'), base) ?? absolute(img.attr('data-src'), base)
}

// ---------- RSS / Atom ----------

// Downloads an RSS/Atom feed and converts each entry into a NewsArticle.
export async function scrapeRss(feedUrl: string): Promise<NewsArticle[]> {
    // Fetch the raw XML, telling the server we want a feed format
    const xml = await fetchText(feedUrl, 'application/rss+xml, application/atom+xml, application/xml, text/xml')
    // xmlMode parses it as XML (not HTML), so tags like <link> are read correctly
    const $ = cheerio.load(xml, { xmlMode: true })
    const articles: NewsArticle[] = []

    // 'item' is an RSS entry, 'entry' is an Atom entry; loop over every article in the feed
    $('item, entry').each((_i, el) => {
        const item = $(el)
        const title = item.find('title').first().text().trim()
        // RSS stores the URL as text (<link>url</link>), Atom as an attribute (<link href="url"/>), so try both
        const linkEl = item.find('link').first()
        const url = absolute(linkEl.text().trim() || linkEl.attr('href'), feedUrl)
        // Skip incomplete entries (in .each, `return` acts like `continue`)
        if (!title || !url) return

        // Try the common image tags in order; `??` moves to the next only if the previous was null.
        // The `\\:` escapes the colon in namespaced tags like <media:content>
        // Try the structured tags first, then fall back to the first <img> inside the item's HTML body
        const image =
        absolute(item.find('media\\:content').first().attr('url'), feedUrl) ??
        absolute(item.find('enclosure').first().attr('url'), feedUrl) ??
        absolute(item.find('media\\:thumbnail').first().attr('url'), feedUrl) ??
        imageFromHtml(item.find('content\\:encoded').first().text(), feedUrl) ??
        imageFromHtml(item.find('description').first().text(), feedUrl)

        // Read the publish date (RSS: pubDate, Atom: published/updated) and parse it
        const rawDate = item.find('pubDate, published, updated').first().text().trim()
        const date = rawDate ? new Date(rawDate) : null

        articles.push({
            title,
            url,
            image,
            // Only keep the date if it parsed validly, stored as a standard ISO string
            publishedAt: date && !isNaN(date.getTime()) ? date.toISOString() : null,
            // RSS uses <dc:creator>, Atom uses <author><name>; null if neither exists
            author:
                item.find('dc\\:creator').first().text().trim() ||
                item.find('author name').first().text().trim() ||
                null
        })
    })
    return articles
}


// ---------- Plain HTML (no feed, no JavaScript needed) ----------

// Scrapes articles from a normal HTML page (for sites with no feed) using the CSS selectors in `sel`.
// Only works if the articles are in the raw HTML, i.e. visible in View Page Source, not added later by JavaScript.
export async function scrapeHtml(pageUrl: string, sel: HtmlSelectors): Promise<NewsArticle[]> {
    // Download the page's HTML and load it into Cheerio so it can be queried with CSS selectors
    const html = await fetchText(pageUrl, 'text/html')
    const $ = cheerio.load(html)
    const articles: NewsArticle[] = []
    // Tracks URLs already collected, so a story shown twice on the page isn't saved twice
    const seen = new Set<string>()

    // Loop over every article container on the page (sel.item)
    $(sel.item).each((_i, el) => {
        const item = $(el)
        // Find the headline link inside this container; its text is the title and its href is the URL
        const a = item.find(sel.link).first()
        const title = a.text().trim()
        const url = absolute(a.attr('href'), pageUrl)
        // Skip cards with a missing title/URL, or a URL we've already seen (`return` acts like `continue`)
        if (!title || !url || seen.has(url)) return
        seen.add(url)

        // Image is optional: use `src`, falling back to `data-src` (where lazy-loading sites keep the real image)
        const img = sel.image ? item.find(sel.image).first() : null
        const image = img ? absolute(img.attr('src'), pageUrl) ?? absolute(img.attr('data-src'), pageUrl) : null

        articles.push({ title, url, image })
    })
    return articles
}