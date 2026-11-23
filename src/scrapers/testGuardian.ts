import { scrapeHtml } from '../scrapers/generic.js'

const articles = await scrapeHtml('https://guardian.ng/', {
    item: 'article',
    link: 'h3 a',
    image: 'a img',
})

console.log('count:', articles.length)
console.table(articles.slice(0, 5))