import joi from 'joi'
import { generalFields } from '../../../../../middlewares/joiValidation.js'
import { categoryValues } from '../../../../../dataBase/models/customTrip.model.js'

const bodyData = {
    placeName: joi.string(),
    latitude: joi.number().min(0),
    longitude: joi.number().min(0),
    category: joi.string().valid(...categoryValues),
    government: joi.string(),
    image: joi.string(),
    activity: joi.string(),
    priceRange: joi.number().min(0)
}

const criticalBodyData = {
    tripId: generalFields._id
}

const headersValidation = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).unknown(true)
}

export const createCustomTripSchema = {
    body: joi.object(bodyData),
    ...headersValidation
}

export const getTripsSchema = {
    ...headersValidation
}

export const updateTripSchema = {
    body: joi.object({
        ...bodyData,
        ...criticalBodyData
    }),
    ...headersValidation
}

export const deleteTripSchema = {
    ...headersValidation,
    body: joi.object({
        ...criticalBodyData
    })
}