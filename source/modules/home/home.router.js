import { Router } from 'express'
import historic_mp_router from './historic_mp/routes.js'
import entertainment_mp_router from './entertainment_mp/routes.js'

const router = Router()

router.use('/historic', historic_mp_router)
router.use('/entertainment', entertainment_mp_router)

export default router