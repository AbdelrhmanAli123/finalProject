import { generateToken, verifyToken } from "../utilities/tokenFunctions.js"
import { touristModel } from "../dataBase/models/tourist.model.js"
import { systemRoles } from "../utilities/systemRoles.js"
import { statuses } from "../utilities/activityStatuses.js"

// TODO : modify this function to authenticate the tourguide after creating the tourGuide model
export const isAuth = (roles = []) => {
    return async (req, res, next) => {
        try {
            const { authorization } = req.headers
            if (!authorization) {
                return next(new Error('token is missing!', { cause: 400 }))
            }
            if (authorization.split(' ')[0] !== process.env.USER_LOGIN_TOKEN_PREFIX) {
                return next(new Error('invalid token prefix', { cause: 400 }))
            }
            // tokenPrefix asvxcvcxvcxvxvx12eds#vcxcxvx
            const splittedToken = authorization.split(' ')[1]
            // another try , catch is made so the variable "splitted token" is seen in a catch scope bcs it wont be seen in the first catch scope
            try {
                // when a token expires , it doesn't get decoded
                const decodedToken = verifyToken({
                    token: splittedToken,
                    signature: process.env.LOGIN_SECRET_KEY
                })
                console.log({ decodedToken })
                if (!decodedToken) {
                    return next(new Error('invalid token', { cause: 400 }))
                }
                if (!decodedToken._id) {
                    return next(new Error('critical token data is missing!', { cause: 400 }))
                }
                let getUser // tourist or tourGuide or other 
                if (decodedToken.role === systemRoles.tourist) {
                    getUser = await touristModel.findOne({
                        _id: decodedToken._id,
                        email: decodedToken.email
                    })
                    if (!getUser) {
                        return next(new Error('user is not found!', { cause: 400 }))
                    }
                    if (getUser.status !== statuses.online) {
                        return next(new Error('user must be logged in!', { cause: 400 }))
                    }
                    if (getUser.confirmed !== true) {
                        return next(new Error('user must be confirmed!', { cause: 400 }))
                    }
                    // this checks the authority of the user
                    if (!roles.includes(getUser.role)) {
                        return next(new Error('un Authorized to access this API', { cause: 401 }))
                    }
                }
                // TODO : tourGuide authentication
                // else if(decodedToken.role === systemRoles.tourGuide) {

                // }
                req.authUser = getUser
                next()
            } catch (error) {
                if (error == 'TokenExpiredError: jwt expired') {
                    const user = await touristModel.findOne({
                        token: splittedToken
                    })
                    // if the token sent is wrong along with being expired :
                    if (!user) {
                        return next(new Error('invalid token', { cause: 400 }))
                    }
                    // generate a new token
                    const newToken = generateToken({
                        signature: process.env.LOGIN_SECRET_KEY,
                        expiresIn: '1d',
                        payload: {
                            email: user.email,
                            _id: user._id,
                            role: user.role
                        }
                    })
                    user.token = newToken
                    user.save()
                    req.authUser = user
                    return res.status(200).json({
                        message: "token refreshed!",
                        newToken
                    })
                }
            }
        } catch (error) {
            console.log(error)
            return next(new Error('user authentication middleware error!', { cause: 500 }))
        }
    }
}