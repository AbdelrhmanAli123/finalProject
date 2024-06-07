import joi from 'joi'
import { generalFields } from '../../../../middlewares/joiValidation.js'

export const getTripsHistory = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}