import {Router} from 'express'
import scraperPunch from '../scrapers/scraperpunch.js'

const router = Router()

router.get('/punch', async (_req, res) => {
    try {
        const articles = await scraperPunch()
        res.json(articles)
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: 'Scraping Failed'
        })
    }
})

export default router; 