import { Router } from "express"
import TGtripsRouter from './tourGuideTrips/routes.js'

const router = Router()

router.use('/TGtrip', TGtripsRouter)

export default router