import joi from 'joi'
import { generalFields } from '../../../../../middlewares/joiValidation.js'

export const getAllTourGuideTrips = {
    query: joi.object({
        page: joi.number().min(1),
        size: joi.number().min(1)
    }),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const viewTourGuide = {
    body: joi.object({
        email: generalFields.jwtToken
    }),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}