import joi from 'joi'
import { generalFields } from '../../middlewares/joiValidation.js'

export const signUpSchema = {
    body: joi.object({
        firstName: joi.string().required(),
        lastName: joi.string().required(),
        languages: joi.array().items(joi.string()).required(),
        // languages: joi.string().required(),
        address: joi.string().required(),
        description: joi.string().optional(),
        birthDate: joi.string().required(),
        phoneNumber: joi.string().length(10).required(),
        email: generalFields.email,
        password: generalFields.password,
        confirmPassword: joi.string().valid(joi.ref('password')).messages({
            'password.confirm.status': 'failed'
        })
    }),
    files: joi.object({
        profilePicture: joi.array().items(joi.object({
            fieldname: joi.string(),
            originalname: joi.string(),
            encoding: joi.string(),
            mimetype: joi.string(),
            destination: joi.string(),
            filename: joi.string(),
            path: joi.string(),
            size: joi.number()
        })).optional(),
        ministryID: joi.array().items(joi.object({
            fieldname: joi.string(),
            originalname: joi.string(),
            encoding: joi.string(),
            mimetype: joi.string(),
            destination: joi.string(),
            filename: joi.string(),
            path: joi.string(),
            size: joi.number()
        })).required(),
        syndicateID: joi.array().items(joi.object({
            fieldname: joi.string(),
            originalname: joi.string(),
            encoding: joi.string(),
            mimetype: joi.string(),
            destination: joi.string(),
            filename: joi.string(),
            path: joi.string(),
            size: joi.number()
        })).required(),
        CV: joi.array().items(joi.object({
            fieldname: joi.string(),
            originalname: joi.string(),
            encoding: joi.string(),
            mimetype: joi.string(),
            destination: joi.string(),
            filename: joi.string(),
            path: joi.string(),
            size: joi.number()
        })).optional()
    })
}

export const confirmAccountSchema = {
    params: joi.object({
        // TODO : fix the jwt token validation regex
        confirmToken: joi.string()
    }).presence('required')
}

export const loginSchema = {
    body: joi.object({
        email: generalFields.email,
        password: joi.string().required()
    }).presence('required')
}

export const forgetPasswordSchema = {
    body: joi.object({
        email: generalFields.email
    })
}

export const resetPasswordSchema = {
    params: joi.object({
        token: joi.string()
    }),
    body: joi.object({
        newPassword: generalFields.password
    })
}