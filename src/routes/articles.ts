import {Router} from 'express'

import { runAllScrapers } from '../services/scraperServices.js'
import { scrapers } from '../scrapers/index.js'

const router = Router()

router.get('/sources', (_req, res) => {
    res.json({ sources: Object.keys(scrapers) })
})

router.get('/', async (req, res) => {
    //picks source from url
    const raw = req.query.source

    //normalizes the three cases of source(s) into one shape, an array:
    const requested = (Array.isArray(raw) ? raw : raw ? [raw] : [])
        //This lets people also write ?source=punch,guardian.
        .flatMap(v => String(v).split(','))
        //Removes stray spaces and lowercases,
        .map(s => s.trim().toLowerCase())
        //Drops empty strings
        .filter(Boolean)

    //collects any requested ids that aren't keys in your scrapers object
    const unknown = requested.filter(id => !Object.hasOwn(scrapers, id))
    if (unknown.length) {
        return res.status(400).json({
            message: `Unknown source(s): ${unknown.join(', ')}`,
            available: Object.keys(scrapers)
        })
    }

    try {
        res.json(await runAllScrapers(requested.length ? requested : undefined))
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: 'Scraping Failed'
        })
    }
})

export default router; 