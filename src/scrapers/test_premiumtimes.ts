import scraperPremiumTimes from "./scraperPremiumTimes.js"

const articles = await scraperPremiumTimes()
console.log('Found:', articles.length)
console.log(articles.slice(0, 3))