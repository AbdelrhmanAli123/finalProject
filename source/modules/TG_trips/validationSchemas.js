import joi from 'joi'
import { generalFields } from '../../middlewares/joiValidation.js'

export const createTripSchema = {
    body: joi.object({
        title: joi.string(),
        brief: joi.string(),
        ticketPerPerson: joi.number().min(0),
        minimumNumber: joi.number().min(1),
        tripDetails: joi.array().items(joi.object({
            dayName: joi.string(),
            dayPlaces: joi.array().items(joi.object({
                placeName: joi.string(),
                placeType: joi.string(),
                latitude: joi.string(),
                longitude: joi.string(),
                activity: joi.string().optional()
            }))
        }))
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
        title: joi.string().optional(),
        brief: joi.string().optional(),
        ticketPerPerson: joi.number().min(0).optional(),
        minimumNumber: joi.number().min(1).optional(),
        tripDetails: joi.array().items(joi.object({
            dayName: joi.string().optional(),
            dayPlaces: joi.array().items(joi.object({
                placeName: joi.string().optional(),
                placeType: joi.string().optional(),
                latitude: joi.string().optional(),
                longitude: joi.string().optional(),
                activity: joi.string().optional()
            })).presence('optional')
        })).presence('optional')
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