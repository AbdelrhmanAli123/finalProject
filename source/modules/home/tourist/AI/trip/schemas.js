import { generalFields } from "../../../../../middlewares/joiValidation.js"
import joi from 'joi'

export const createAItrip = {
    body: joi.object({
        tripDetails: joi.object({}).required().unknown(true),
        title: joi.string().required(),
        from: joi.string().required(),
        to: joi.string().required()
    }),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).unknown(true)
}