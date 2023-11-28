import joi from 'joi'
import { generalFields } from '../../middlewares/joiValidation.js'

export const signUpValidSchema = {
    // userName , pass , email
    body: joi.object({
        userName: joi.string().required(),
        email: generalFields.email,
        password: generalFields.password,
        confirmPassword: joi.string().valid(joi.ref('password')).messages({
            'password.confirm.status': 'failed'
        }).required(),
        phoneNumber: joi.string().length(11).optional(),
        gender: joi.string().valid('male', 'female').optional(),
        age: joi.number().optional(),
        language: joi.string().optional()
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
        })),
        coverPicture: joi.array().items(joi.object({
            fieldname: joi.string(),
            originalname: joi.string(),
            encoding: joi.string(),
            mimetype: joi.string(),
            destination: joi.string(),
            filename: joi.string(),
            path: joi.string(),
            size: joi.number()
        }))
    }).unknown(true).presence('optional').options({ presence: 'optional' })
}

export const confirmAccountSchema = {
    params: joi.object({
        // TODO : fix the jwt token validation regex
        confirmToken: joi.string()
    }).presence('required')
}

export const touristLoginSchema = {
    body: joi.object({
        email: generalFields.email,
        password: joi.string()
    }).presence('required')
}

export const touristForgetPassSchema = {
    body: joi.object({
        email: generalFields.email
    })
}

export const touristResetPassSchema = {
    params: joi.object({
        token: joi.string()
    }),
    body: joi.object({
        newPassword: generalFields.password
    })
}

export const touristProfileSetUpSchema = {
    body: joi.object({
        phoneNumber: joi.string().length(11),
        gender: joi.string().valid('male', 'female'),
        age: joi.number(),
        language: joi.string()
    }).presence('optional'),
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
        })),
        coverPicture: joi.array().items(joi.object({
            fieldname: joi.string(),
            originalname: joi.string(),
            encoding: joi.string(),
            mimetype: joi.string(),
            destination: joi.string(),
            filename: joi.string(),
            path: joi.string(),
            size: joi.number()
        }))
    }).unknown(true).presence('optional').options({ presence: 'optional' }),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const viewProfileSchmea = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const deleteUser = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const changePassword = {
    body: joi.object({
        oldPassword: generalFields.password,
        newPassword: generalFields.password,
        confirmNewPassword: joi.string().valid(joi.ref('newPassword')).messages({
            'newPassword confirm status': 'failed to confirm the new password'
        })
    }).presence('required'),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const confirmOldPasswordSchema = {
    body: joi.object({
        oldPassword: generalFields.password
    }).presence('required'),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const changeOldPassSchema = {
    body: joi.object({
        newPassword: generalFields.password,
        confirmNewPassword: joi.string().valid(joi.ref('newPassword')).messages({
            'password.confirm.status': 'failed'
        })
    }).presence('required'),
    params: joi.object({
        passToken: joi.string()
    }).presence('required'),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const logout = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}