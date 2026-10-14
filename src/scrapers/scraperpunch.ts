import puppeteer, { Browser } from 'puppeteer'
import * as cheerio from 'cheerio'
import { Interface } from 'readline'

//Defines the format returned by this scraper
//Shared by other scrapers for uniformity

export interface NewsArticle{
    title: string,
    image: string | null,
    url: string
}

export default async function scraperPunch(): Promise<NewsArticle[]> {

    //Hompage to scrape
    const url = 'https://punchng.com'

    //Launch a headless broswer so Puppeteer can open the page
    const browser = await puppeteer.launch({
        headless: true
    })

    try {
        const page = await browser.newPage()

        //setting a realistic viewport for consistent page rendering
        await page.setViewport({
            width: 1366,
            height: 900
        })

        //Navigate to news site's homepage
        //domcontentLoaded waits for the initial HTML document to load
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        })

        //Wait until article headlines appear
        await page.waitForSelector('article h2.post-title a', {
            timeout: 20000
        })

        //Get the rendered HTML and load it into Cheerio
        const htmlContent = await page.content()
        const $ = cheerio.load(htmlContent)

        //Store all extracted articles here
        const articles: NewsArticle[] = []

        //Vist each 'article' container on the home page
        $('article').each((_index, element) => {
            const article = $(element)

            // ---------------------------------------
            // 1) Extract the headline and URL
            // ---------------------------------------

            // Observed structure in Dev Tools for Punchng.com
            // <article> --> <h2.post-title> --> <a>
            
            const headlineLink = article
                .find('div.post-content h2.post-title a')
                .first()

            const title = headlineLink.text().trim()
            const href = headlineLink.attr('href')

            //Skip this container if the headline or URL is missing
            if (!title || !href){
                return;
            }

            //Accept only absolute links
            let articleUrl: string

            try {
                const parsedUrl = new URL(href, url)

                //Only accept https or http links
                if (!['http:', 'https:'].includes(parsedUrl.protocol)){
                    return
                }

                articleUrl = parsedUrl.href
            } catch (error) {
                //ignore malformed urls 
            }

            // ---------------------------------------
            // 2) Extract the article image
            // ---------------------------------------

            let image: string | null = null
            
            //Image inside <picture> tag nestled in <a>
            const picture = headlineLink.find('picture').first()

            //Prefer a WebP source as observed in Page HTML
            const webpSource = picture
                .find('source[type="image/webp"]')
                .first()
            
            const srcset = webpSource.attr('srcset')

            if (srcset) {
                //A srcset can contain several comma separated candidates each followed by a width descriptor
                const candidates = srcset
                    .split(',')
                    .map(candidate => {
                        const parts = candidate.trim().split(/\s+/)

                        return {
                            url: parts[0],
                            width: parseInt(parts[1], 10) || 0
                        }
                    })
                    .filter(candidate => Boolean(candidate.url))

                //Prefer the candidate with the greatest declared width                
                candidates.sort((a, b) => b.width - a.width)

                image = candidates[0]?.url ?? null
            }

            // ---------------------------------------
            // 3) Avoid duplicate articles
            // ---------------------------------------

            //Multiple elements on a homepage can link to the same story
            if (articles.some(item => item.url == articleUrl)){
                return
            }

            // ---------------------------------------
            // 4) Store the extracted article
            // ---------------------------------------
            articles.push({
                title,
                image,
                url: articleUrl
            })
        })

    } catch (error) {
        
    } finally {

    }
}