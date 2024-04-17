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

export const requestAtripSchema = {
    body: joi.object({
        tripID: generalFields._id.required(),
        userName: joi.string().required(),
        startTripDate: joi.string().optional(),
        email: generalFields.email,
        country: joi.string().optional(),
        countryFlag: joi.string().optional(),
        phoneNumber: joi.string(),
        tripType: joi.string().valid('standard', 'luxury', 'vip').required(),
        travelers: joi.number().required().min(0),
        age: joi.number().min(0),
        totalPrice: joi.number().min(0),
        comment: joi.string().min(0).max(255)
    }),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}