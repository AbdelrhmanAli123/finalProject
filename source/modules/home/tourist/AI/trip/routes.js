import {
    AItripAPIroles, AIcont, AIvs, Router, asyncHandler, isAuth,
    multerHostFunction, validationCoreFunction
} from './routes.imports.js'

const router = Router()

router.post(
    '/createTrip',
    isAuth(AItripAPIroles.createTrip),
    asyncHandler(AIcont.createAItrip)
)

router.get(
    '/getTrip',
    isAuth(AItripAPIroles.createTrip),
    asyncHandler(AIcont.getTrip)
)

export default router