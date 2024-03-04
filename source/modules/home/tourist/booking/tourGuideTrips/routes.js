import {
    BookingCont, BookingRoles, BookingVS, Router, asyncHandler, multerCallBackVersion, multerHostFunction,
    multertempFunction, validationCoreFunction, isAuth
} from './routes.imports.js'

const router = Router()

router.get(
    '/getAllTrips',
    isAuth(BookingRoles.GetTG_trips),
    asyncHandler(BookingCont.getAllTrips)
)

export default router