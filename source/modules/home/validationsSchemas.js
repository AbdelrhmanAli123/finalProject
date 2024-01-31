import joi from 'joi'
import { generalFields } from '../../middlewares/joiValidation.js'

export const addPlaceSchema = {
    body: joi.object({
        name: joi.string().required(),
        type: joi.string().valid('monument', 'islamic', 'nearby').required(),
        location: joi.object({
            longitude: joi.string().optional(),
            latitude: joi.string().optional(),
        }).optional(true),
        details: joi.string().min(200).required(),
        ticket_price: joi.number().min(0).required()
    }).presence('required'),
    file: joi.object({
        fieldname: joi.string(),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        size: joi.number()
    }).presence('required')
}

const test = await addPlaceSchema.body.validate('value', { abortEarly: false }).error.message

export const editPlaceSchema = {
    body: joi.object({
        name: joi.string().required(),
        type: joi.string().valid('monument', 'islamic', 'nearby').optional(),
        location: joi.object({
            longitude: joi.string().optional(),
            latitude: joi.string().optional(),
        }).optional(true),
        details: joi.string().min(200).optional(),
        ticket_price: joi.number().min(0).optional()
    }).presence('required'),
    file: joi.object({
        fieldname: joi.string(),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        size: joi.number()
    }).presence('optional')
}

export const getPlaceDataSchema = {
    body: joi.object({
        name: joi.string().required()
    }).presence('required')
}

export const getAllPlacesSchema = {
    body: joi.object().presence('optional'),
    file: joi.object().presence('forbidden'),
    files: joi.object().presence('forbidden')
}

export const deletePlaceSchema = {
    body: joi.object({
        name: joi.alternatives().try(
            joi.string().required(),
            joi.array().items(joi.string()).required()
        )
    }).presence('required')
}