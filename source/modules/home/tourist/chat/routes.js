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

router.get(
    '/getChat',
    isAuth(ChatRoles.getRecentChat),
    asyncHandler(ChatCont.getChat)
)

router.get(
    '/getTGMeta',
    isAuth(ChatRoles.getRecentChat),
    asyncHandler(ChatCont.getTGMeta)
)

export default router