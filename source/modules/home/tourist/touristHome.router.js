import { Router } from "express"
import discoverPlacesRouter from './discoverPlaces/discover.router.js'
import profileRouter from './profile/routes.js'
import settingsRouter from './settings/routes.js'
import AIrouter from './AI/AI.router.js'

import { profileAPIroles } from "./profile/roles.js";
import { asyncHandler, isAuth, profileCont, profileVS, validationCoreFunction } from "./profile/routes.imports.js";

const router = Router()

router.use('/discoverPlaces', discoverPlacesRouter)
router.use('/profile', profileRouter)
router.use('/settings', settingsRouter)
router.use('/AI', AIrouter)

router.post(
    '/logout',
    isAuth(profileAPIroles.logout),
    validationCoreFunction(profileVS.logout),
    asyncHandler(profileCont.logOut)
)

export default router