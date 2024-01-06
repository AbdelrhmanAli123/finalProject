import {
    Router, isAuth, validationCoreFunction, asyncHandler, multerHostFunction, touristCont, touristVS,
    allowedExtensions, touristAPIroles
} from './tourist.routes.imports.js'

import * as testCont from './test.js'
import { multertempFunction } from '../../services/multerHost.js'

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

// depricated
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
    '/changeoldPass',
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

router.patch(
    '/testAny',
    isAuth(touristAPIroles.profile_setUp),
    multerHostFunction(allowedExtensions.image).any(),
    validationCoreFunction(touristVS.testSchema),
    asyncHandler(touristCont.test)
)

router.post(
    '/test2',
    multerHostFunction(allowedExtensions.image).single('photo'),
    asyncHandler(touristCont.test2)
)

router.post(
    '/AItest',
    multerHostFunction().single('image'),
    asyncHandler(testCont.fetch_request2)
)

router.post(
    '/AItest2',
    multertempFunction().single('image'),
    asyncHandler(testCont.axios_request2)
)

export default router