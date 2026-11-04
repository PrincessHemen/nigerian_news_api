import scraperPunch from "./scraperpunch.js";
import scraperPremiumTimes from "./scraperPremiumTimes.js";

//use this to test API's whether they allow scraping, before you start:
//curl -s -o /dev/null -w "%{http_code}\n" -A "Mozilla/5.0" https://SITE/feed

//theCable failed; Cloudfare blocking all scrapers 

export const scrapers = {
    punch: scraperPunch,
    "premium-times": scraperPremiumTimes
}