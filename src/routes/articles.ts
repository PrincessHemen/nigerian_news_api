import {Router} from 'express'

import { runAllScrapers } from '../services/scraperServices.js'

const router = Router()

router.get('/', async (_req, res) => {
    try {
        res.json(await runAllScrapers())
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: 'Scraping Failed'
        })
    }
})

export default router; 