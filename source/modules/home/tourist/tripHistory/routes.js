import { Router } from 'express'
import { validationCoreFunction } from '../../../../middlewares/joiValidation.js'
import * as cont from './controller.js'
import * as schemas from './schemas.js'
import { isAuth } from '../../../../middlewares/auth.js'
import { systemRoles } from "../../../../utilities/systemRoles.js"
import { asyncHandler } from '../../../../utilities/asyncHandler.js'

const router = Router()

router.get(
    '/getTrips',
    isAuth([systemRoles.tourist]),
    validationCoreFunction(schemas.getTripsHistory),
    asyncHandler(cont.getAllTrips)
)

export default router