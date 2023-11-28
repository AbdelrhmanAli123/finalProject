import {
    Router, isAuth, validationCoreFunction, asyncHandler, multerHostFunction, touristCont, touristVS,
    allowedExtensions, touristAPIroles
} from './tourist.routes.imports.js'

const router = Router()

router.post(
    '/signUp',
    multerHostFunction(allowedExtensions.image).fields([
        { name: 'profilePicture', maxCount: 1 }, // array of objects
        { name: 'coverPicture', maxCount: 1 } // array of objects
    ]),
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

router.post(
    '/logout',
    isAuth(touristAPIroles.logout),
    validationCoreFunction(touristVS.logout),
    asyncHandler(touristCont.logOut)
)

router.post(
    '/profileSetUp',
    isAuth(touristAPIroles.profile_setUp),
    multerHostFunction(allowedExtensions.image).fields([
        { name: 'profilePicture', maxCount: 1 },
        { name: 'coverPicture', maxCount: 1 }
    ]),
    validationCoreFunction(touristVS.touristProfileSetUpSchema),
    asyncHandler(touristCont.profileSetUp)
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
    '/changePassword',
    isAuth(touristAPIroles.changePassword),
    validationCoreFunction(touristVS.changePassword),
    asyncHandler(touristCont.changePassword)
)

router.get(
    '/confirmOldPassword',
    isAuth(touristAPIroles.changePassword),
    validationCoreFunction(touristVS.confirmOldPasswordSchema),
    asyncHandler(touristCont.confrirmOldPass)
)

router.patch(
    '/changeoldPass:passToken',
    isAuth(touristAPIroles.changePassword),
    validationCoreFunction(touristVS.changeOldPassSchema),
    asyncHandler(touristCont.changeOldPass)
)

router.get(
    '/viewProfile',
    isAuth(touristAPIroles.getUserInfo),
    validationCoreFunction(touristVS.viewProfileSchmea),
    asyncHandler(touristCont.getUserInfo)
)

router.delete(
    '/deleteUser',
    isAuth(touristAPIroles.deleteUser),
    validationCoreFunction(touristVS.deleteUser),
    asyncHandler(touristCont.deleteUser)
)

export default router