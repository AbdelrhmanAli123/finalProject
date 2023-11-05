import {
    Router, isAuth, validationCoreFunction, asyncHandler, multerHostFunction, touristCont, touristVS,
    allowedExtensions, touristAPIroles
} from './tourist.routes.imports.js'

const router = Router()

router.post(
    '/signUp',
    multerHostFunction(allowedExtensions.image).single('profilePicture'),
    validationCoreFunction(touristVS.signUpValidSchema),
    asyncHandler(touristCont.TouristSignUp)
)

router.get(
    '/confirmAccount:confirmToken',
    validationCoreFunction(touristVS.confirmAccountSchema),
    asyncHandler(touristCont.confirmAccount)
)

router.post(
    '/logIn',
    validationCoreFunction(touristVS.touristLoginSchema),
    asyncHandler(touristCont.touristLogIn)
)

router.patch(
    '/forgetPassword',
    validationCoreFunction(touristVS.touristForgetPassSchema),
    asyncHandler(touristCont.forgetPassword)
)

router.patch(
    '/resetPassword:token',
    validationCoreFunction(touristVS.touristResetPassSchema),
    asyncHandler(touristCont.resetPassword)
)

router.patch(
    '/profileSetUp',
    isAuth(touristAPIroles.profile_setUp),
    multerHostFunction(allowedExtensions.image).single('profilePicture'),
    validationCoreFunction(touristVS.touristProfileSetUpSchema),
    asyncHandler(touristCont.profileSetUp)
)

export default router