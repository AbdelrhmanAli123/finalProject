import {
    ChatCont, ChatRoles, ChatVS, asyncHandler, isAuth, multerCallBackVersion,
    multerHostFunction, multertempFunction, validationCoreFunction, Router
} from './routes.imports.js'

const router = Router()

router.get(
    '/getNowTime',
    asyncHandler(ChatCont.MomentTest)
)

router.post(
    '/AddChatManually',
    asyncHandler(ChatCont.AddChatManually)
)

router.get(
    '/getRecentChats',
    isAuth(ChatRoles.getRecentChat),
    asyncHandler(ChatCont.getRecentChats)
)

export default router