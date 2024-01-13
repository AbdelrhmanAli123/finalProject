import {
    Router, isAuth, validationCoreFunction, asyncHandler, multerHostFunction, allowedExtensions,
} from '../tourist/tourist.routes.imports.js'
import * as auth_cont from './auth.controller.js'
import * as auth_vs from './auth.validation.schemas.js'
import { authAPIroles } from './auth.endpoints.js'

const router = Router()

router.get(
    '/getProfile',
    isAuth(authAPIroles.getUserInfo),
    validationCoreFunction(auth_vs.viewProfileSchmea),
    asyncHandler(auth_cont.getUserInfo)
)

router.post(
    '/logout',
    isAuth(authAPIroles.logout),
    validationCoreFunction(auth_vs.logout),
    asyncHandler(auth_cont.logOut)
)

router.get(
    '/confirmOldPassword',
    isAuth(authAPIroles.changePassword),
    validationCoreFunction(auth_vs.confirmOldPasswordSchema),
    asyncHandler(auth_cont.confrirmOldPass)
)

router.patch(
    '/changeoldPass',
    isAuth(authAPIroles.changePassword),
    validationCoreFunction(auth_vs.changeOldPassSchema),
    asyncHandler(auth_cont.changeOldPass)
)

router.delete(
    '/deleteUser',
    isAuth(authAPIroles.deleteUser),
    validationCoreFunction(auth_vs.deleteUser),
    asyncHandler(auth_cont.new_deleteUser)
)

export default router