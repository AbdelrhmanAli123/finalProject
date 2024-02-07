import { Router } from "express"
import discoverPlacesRouter from './discoverPlaces/discover.router.js'
import profileRouter from './profile/routes.js'
import settingsRouter from './settings/routes.js'

const router = Router()

router.use('/discoverPlaces', discoverPlacesRouter)
router.use('/profile', profileRouter)
router.use('/settings', settingsRouter)

export default router