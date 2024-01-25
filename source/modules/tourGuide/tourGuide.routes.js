import {
    Router, TG_cont, TG_vs, allowedExtensions, asyncHandler, isAuth, multerHostFunction,
    validationCoreFunction, multertempFunction, TG_API_roles
} from './tourGuide.routes.imports.js'
import * as airLabs from './airlabs_test.js'

const router = Router()

router.post(
    '/signUp',
    multertempFunction([...allowedExtensions.image, ...allowedExtensions.application]).fields([
        { name: "profilePicture", maxCount: 1 },
        { name: "ministryID", maxCount: 1 },
        { name: "syndicateID", maxCount: 1 },
        { name: "CV", maxCount: 1 }
    ]),
    validationCoreFunction(TG_vs.signUpSchema),
    asyncHandler(TG_cont.TG_signUp)
)

router.get(
    '/confirmAccount:confirmToken',
    validationCoreFunction(TG_vs.confirmAccountSchema),
    asyncHandler(TG_cont.TG_confirmAccount)
)

router.post(
    '/logIn',
    validationCoreFunction(TG_vs.loginSchema),
    asyncHandler(TG_cont.TG_login)
)

router.patch(
    '/forgetPassword',
    validationCoreFunction(TG_vs.forgetPasswordSchema),
    asyncHandler(TG_cont.TG_forgetPassword)
)

router.patch(
    '/resetPassword:token',
    validationCoreFunction(TG_vs.resetPasswordSchema),
    asyncHandler(TG_cont.TG_resetPassword)
)

router.patch(
    '/updateProfile',
    isAuth(TG_API_roles.updateProfile),
    multerHostFunction([...allowedExtensions.image, ...allowedExtensions.application])
        .fields([
            { name: "profilePicture", maxCount: 1 },
            { name: "CV", maxCount: 1 }
        ]),
    validationCoreFunction(TG_vs.updateProfileSchema),
    asyncHandler(TG_cont.TG_updateProfile)
)

router.get(
    '/arilabsTest1',
    asyncHandler(airLabs.airlabsTest1)
)

export default router