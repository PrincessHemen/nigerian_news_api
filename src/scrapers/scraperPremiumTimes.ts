import puppeteer, { Browser } from 'puppeteer'
import * as cheerio from 'cheerio'

//Defines the format returned by this scraper
//Shared by other scrapers for uniformity

export interface NewsArticle{
    title: string,
    image: string | null,
    url: string
}

export default async function scraperPremiumTimes(): Promise<NewsArticle[]> {

    //Hompage to scrape
    const url = 'https://www.premiumtimesng.com/'

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
        await page.waitForSelector('article h3.jeg_post_title a', {
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

            // Observed structure in Dev Tools for premiumtimesng.com
            // div.jeg_block_container --> div.jeg_posts --> article.jeg_post --> div.jeg_postblock_content --> h3.jeg_post_title --> a
            
            const headlineLink = article.find('h3.jeg_post_title a').first()
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
                return 
            }

            // ---------------------------------------
            // 2) Extract the article image
            // ---------------------------------------

            //Observed structure in Dev Tools for pictures for Premium Times: div.jeg_block_container --> div.jeg_posts --> article.jeg_post --> div.jeg_thumb --> a --> div.thumbnail.container --> img

            const img = article.find('.jeg_thumb img').first()
            const src = img.attr('data-src') || img.attr('data-lazy-src') || img.attr('src')
            
            const image = src && !src.startsWith('data:') ? new URL(src, url).href : null

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

        return articles

    } catch (error) {
        console.error('Premium Times newspaper scraping failed', error)
        throw error 
    } finally {
        await browser.close()
    }
}

//check if the way I'm calling the html sections is correct for page.waitforselector, for finding headline, and for finding the image 