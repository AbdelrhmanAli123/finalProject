import { Router } from 'express'

import touristHomeRouter from './tourist/touristHome.router.js'
import tourGuideHomeRouter from './tourGuide/tourGuideHome.router.js'

const router = Router()

router.use('/tourist', touristHomeRouter)
router.use('/tourGuide', tourGuideHomeRouter)

export default router