import {
    bcrypt, chatModel, tourGuideModel, touristModel, moment, momentTZ, StatusCodes, getIo, statuses
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
    }).select('-POne.ID -PTwo.ID').sort({ lastDate: -1 })
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
        if (chat.POne.email === user.email) {
            chat.POne.email = null
        } else {
            chat.PTwo.email = null
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
    const { chatid } = req.headers // database ID
    console.log({
        request_body: req.body,
        chatid: req.body.chatid,
        headers: req.headers
    })

    const getChat = await chatModel.findOne({
        $and: [
            { _id: chatid },
            {
                $or: [
                    { 'POne.ID': user._id },
                    { 'PTwo.ID': user._id }
                ]
            }
        ]
    }).select('-POne.ID -PTwo.ID')

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
    const getTGs = await tourGuideModel.find().select('-_id firstName profilePicture.secure_url status email')

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
    const { _id, email } = req.authUser // sender
    const { destEmail, message } = req.body
    const getChat = await chatModel.findOne({
        $or: [
            {
                $and: [
                    { 'POne.email': email },
                    { 'PTwo.email': destEmail }
                ]
            },
            {
                $and: [
                    { 'POne.email': destEmail },
                    { 'PTwo.email': email }
                ]
            }
        ]
    })

    const secondParticipant = await Promise.all([
        touristModel.findOne({ email: destEmail }),
        tourGuideModel.findOne({ email: destEmail })
    ])
    let secondPId
    if (secondParticipant[0]) {
        secondPId = secondParticipant[0]._id
    } else {
        secondPId = secondParticipant[1]._id
    }

    if (!getChat) {
        console.log({ message: "chat is not found!" })
        // create a new chat
        let newChatData = {
            POne: {
                ID: _id
            },
            PTwo: {
                ID: secondPId
            },
            messages: [
                {
                    from: email,
                    to: destEmail,
                    message: message,
                    date: Date.now()
                }
            ]
        }
        await chatModel.create(newChatData).then(() => console.log({ message: "new chat is created!" }))
        newChatData = null
    }

    console.log({
        message: "chat is found!",
        chat: getChat
    })

    const getReceiver = await Promise.all([
        touristModel.findOne({ email: destEmail }),
        tourGuideModel.findOne({ email: destEmail })
    ])

    let receiverSocket
    if (getReceiver[0]) {
        if (getReceiver[0].socketID !== null && getReceiver[0].status === statuses.online) {
            receiverSocket = getReceiver[0].socketID
        } else {
            console.log({ error_message: "user either has no socketID or he is not online!" })
            return next(new Error("user either has no socketID or he is not online!", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        }
    } else if (getReceiver[1]) {
        if (getReceiver[1].socketID !== null && getReceiver[1].status === statuses.online) {
            receiverSocket = getReceiver[1].socketID
        } else {
            console.log({ error_message: "user either has no socketID or he is not online!" })
            return next(new Error("user either has no socketID or he is not online!", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        }
    }

    const messageData = {
        from: email,
        to: destEmail,
        message: message,
        date: Date.now()
    }

    getChat.messages.push(messageData)
    console.log({ new_chat_messages: getChat.messages })
    await getChat.save()
    console.log({ new_chat_messages: getChat.messages })


    getIo().to(receiverSocket).emit('receiveMessage', messageData)

    res.status(200).json({
        message: "message sent"
    })
}