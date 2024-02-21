import joi from 'joi'
import { generalFields } from '../../../../middlewares/joiValidation.js'

export const createTripSchema = {
    body: joi.object({
        title: joi.string(),
        brief: joi.string(),
        // ticketPerPerson: joi.number().min(0),
        plans: joi.object({
            standard: joi.number().min(0).optional(),
            luxury: joi.number().min(0).optional(),
            VIP: joi.number().min(0).optional()
        }).optional(),
        maximumNumber: joi.number().min(1).required(),
        tripDetails: joi.array().items(joi.object({
            dayName: joi.string(),
            dayPlaces: joi.array().items(joi.object({
                placeName: joi.string(),
                placeType: joi.string(),
                latitude: joi.string().optional(),
                longitude: joi.string().optional(),
                activity: joi.string().optional()
            }))
        })),
        included: joi.array().items(joi.string()).optional(),
        excluded: joi.array().items(joi.string()).optional()
    }),
    file: joi.object({
        fieldname: joi.string(),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        size: joi.number()
    }).presence('optional'),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const editTripSchema = {
    body: joi.object({
        trip_id: generalFields._id.required(),
        title: joi.string().optional(),
        brief: joi.string().optional(),
        // ticketPerPerson: joi.number().min(0).optional(),
        plans: joi.object({
            standard: joi.number().min(0).optional(),
            luxury: joi.number().min(0).optional(),
            VIP: joi.number().min(0).optional()
        }).optional(),
        maximumNumber: joi.number().min(1).optional(), // [{day1},{day2},{day3},{day4}]
        newDay: joi.object({
            dayName: joi.string().optional(),
            dayPlaces: joi.array().items(joi.object({
                placeName: joi.string().optional(),
                placeType: joi.string().optional(),
                latitude: joi.string().optional(),
                longitude: joi.string().optional(),
                activity: joi.string().optional()
            })).presence('optional')
        }).optional(true), // {day4}
        removeDay: generalFields._id.optional(),
        newTripDetails: joi.array().items(joi.object({
            dayName: joi.string().optional(),
            dayPlaces: joi.array().items(joi.object({
                placeName: joi.string().optional(),
                placeType: joi.string().optional(),
                latitude: joi.string().optional(),
                longitude: joi.string().optional(),
                activity: joi.string().optional()
            })).presence('optional')
        })).presence('optional'),
        included: joi.array().items(joi.string()).optional(),
        excluded: joi.array().items(joi.string()).optional()
    }).presence('optional'),
    file: joi.object({
        fieldname: joi.string(),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        size: joi.number()
    }).presence('optional'),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const deleteTripSchema = {
    body: joi.object({
        trip_id: generalFields._id.required()
    }).presence('required'),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const getAllTripsSchema = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}