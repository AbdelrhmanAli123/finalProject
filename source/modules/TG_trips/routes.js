import {
    Router, TG_trip_cont, TG_trip_vs, allowedExtensions, asyncHandler,
    isAuth, multerHostFunction, tripAPIroles, validationCoreFunction
} from './routes.imports.js'

const router = Router()

router.post(
    '/createTrip',
    isAuth(tripAPIroles.createTrip),
    multerHostFunction(allowedExtensions.image).single('image'),
    validationCoreFunction(TG_trip_vs.createTripSchema),
    asyncHandler(TG_trip_cont.generateTrip)
)

router.patch(
    '/editTrip',
    isAuth(tripAPIroles.editTrip),
    multerHostFunction(allowedExtensions.image).single('image'),
    validationCoreFunction(TG_trip_vs.editTripSchema),
    asyncHandler(TG_trip_cont.editTrip)
)

export default router