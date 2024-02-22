import { generalFields } from "../../../../../middlewares/joiValidation.js"
import joi from 'joi'

export const createAItrip = {
    // body: joi.object({
    //     tripDetails: joi.object().pattern(
    //         joi.string().required(),
    //         joi.number().required(),
    //         joi.number().required(),
    //         joi.string().required(),
    //         joi.string().required()
    //     )
    // }),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).unknown(true)
}