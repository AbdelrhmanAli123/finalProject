import joi from 'joi'
import { generalFields } from '../../../../middlewares/joiValidation.js'

export const getRecentChatsSchema = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const getChatSchema = {
    body: joi.object({
        ChatID: generalFields._id
    }),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const getTGMetaSchema = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const sendMessageSchema = {
    body: joi.object({
        destID: generalFields._id,
        message: joi.string().min(1).max(255)
    }),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}