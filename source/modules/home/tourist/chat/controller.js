import {
    bcrypt, chatModel, tourGuideModel, touristModel, moment, momentTZ, StatusCodes, getIo
} from './controller.imports.js'

export const MomentTest = async (req, res, next) => {
    const DateStringVariable = Date.parse('3/8/2024')
    const DateLocalVariable = Date.now().valueOf()
    const DateExpoVariable = Date.now().toExponential()
    const DatePrecisionVariable = Date.now().toPrecision()
    const DateFixedVariable = Date.now().toFixed()
    // const nowTime = moment.isDate(moment.now())
    console.log({
        // nowTime: nowTime,
        string_time: DateStringVariable,
        local_time: DateLocalVariable,
        expo_time: DateExpoVariable,
        precision_time: DatePrecisionVariable,
        fixed_time: DateFixedVariable
    })
    console.warn({
        // nowTime: nowTime,
        string_time: DateStringVariable,
        local_time: DateLocalVariable,
        expo_time: DateExpoVariable,
        precision_time: DatePrecisionVariable,
        fixed_time: DateFixedVariable
    })
    console.error({
        // nowTime: nowTime,
        string_time: DateStringVariable,
        local_time: DateLocalVariable,
        expo_time: DateExpoVariable,
        precision_time: DatePrecisionVariable,
        fixed_time: DateFixedVariable
    })
    res.json({
        string_time: DateStringVariable,
        local_time: DateLocalVariable,
        expo_time: DateExpoVariable,
        precision_time: DatePrecisionVariable,
        fixed_time: DateFixedVariable
        // currentTime: nowTime
    })
}

export const getTourGuidesMeta = async (req, res, next) => {

}

export const AddChatManually = async (req, res, next) => {
    const {
        POne, PTwo, messages
    } = req.body
    const newChat = chatModel.create({
        POne, PTwo, messages
    })
    res.json({ message: 'done' })
}

export const getRecentChats = async (req, res, next) => {
    const user = req.authUser
    const getAllAssocChats = await chatModel.find({
        $or: [
            { 'POne.ID': user._id },
            { 'PTwo.ID': user._id }
        ],
    }).sort({ lastDate: -1 })
    if (getAllAssocChats.length == null || getAllAssocChats.length == 0) {
        console.log({ message: "the user has no chats" })
        return res.status(StatusCodes.NO_CONTENT).json() // 204
    }
    console.log({ getAllAssocChats })

    let result = getAllAssocChats
    console.log({ result })
    result.forEach((chat) => {
        // i want to send only the last message
        if (chat.messages.length > 0) {
            chat.messages = chat.messages.at(-1)
        }
        // i want to null the meta data of the auth User and leave the meta data of his versus chat participant , so i check which one the request user is and i null him
        if (chat.POne.ID.toString() === user._id.toString()) {
            chat.POne.ID = null
        } else {
            chat.PTwo.ID = null
        }
    })
    console.log({ result_after_editing: result })

    return res.status(StatusCodes.OK).json({
        message: "chats found!",
        chats: result
    })
}

export const getChat = async (req, res, next) => {
    const user = req.authUser
    const { chatID } = req.body

    const getChat = await chatModel.findOne({
        $and: [
            { _id: chatID },
            {
                $or: [
                    { 'POne.ID': user._id },
                    { 'PTwo.ID': user._id }
                ]
            }
        ]
    })

    if (!getChat) {
        console.log({ error_message: "either the chat doesn't include the user or the chat doesn't exist" })
        return next(new Error("either the chat doesn't include the user or the chat doesn't exist", { cause: StatusCodes.BAD_REQUEST }))
    }
    console.log({ message: "chat found", found_chat: getChat })

    res.status(StatusCodes.OK).json({
        message: "chat is found!",
        chat: getChat
    })
}

export const getTGMeta = async (req, res, next) => {
    const getTGs = await tourGuideModel.find().select('-_id firstName profilePicture.secure_url status')

    if (!getTGs) {
        console.log({
            message: "no tour guides were found!"
        })
        return next(new Error('no tour guides were found!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }

    res.status(200).json({
        message: "tour guides meta data found",
        tourGuides: getTGs
    })
}

export const sendMessage = async (req, res, next) => {
    // TODO : change later to Email instead of _id in the model and the get APIs
    const { _id } = req.authUser // sender
    const { destID, message, destEmail } = req.body
    const getChat = await chatModel.findOne({
        $or: [
            {
                $and: [
                    { 'POne.ID': _id },
                    { 'PTwo.ID': destID }
                ]
            },
            {
                $and: [
                    { 'POne.ID': destID },
                    { 'PTwo.ID': _id }
                ]
            }
        ]
    })

    if (!getChat) {
        console.log({ message: "chat is not found!" })
        return next(new Error('chat is not found!', { cause: StatusCodes.BAD_REQUEST }))
    }

    console.log({
        message: "chat is found!",
        chat: getChat
    })

    // const getReceiver = await Promise.all([
    //     touristModel
    // ])

    const messageData = {
        from: _id,
        to: destID,
        message: message,
    }

    getChat.messages.push(messageData)
    console.log({ new_chat_messages: getChat.messages })
    await getChat.save()
    console.log({ new_chat_messages: getChat.messages })

    getIo.to()
}