import { generateToken, verifyToken } from "../utilities/tokenFunctions.js"
import { touristModel } from "../dataBase/models/tourist.model.js"
import { systemRoles } from "../utilities/systemRoles.js"
import { statuses } from "../utilities/activityStatuses.js"

// TODO : modify this function to authenticate the tourguide after creating the tourGuide model
export const isAuth = (roles = []) => {
    return async (req, res, next) => {
        try {
            console.log("\nAUTHENTICATION\n")
            const { authorization } = req.headers
            console.log({ token: authorization })
            if (!authorization) {
                return next(new Error('token is missing!', { cause: 400 }))
            }
            console.log({ token_prefix: authorization.split(' ')[0] })
            if (authorization.split(' ')[0] !== process.env.USER_LOGIN_TOKEN_PREFIX) {
                return next(new Error('invalid token prefix', { cause: 400 }))
            }
            // tokenPrefix asvxcvcxvcxvxvx12eds#vcxcxvx
            const splittedToken = authorization.split(' ')[1]
            console.log({ splitted_Token: splittedToken })
            // another try , catch is made so the variable "splitted token" is seen in a catch scope bcs it wont be seen in the first catch scope
            try {
                // when a token expires , it doesn't get decoded
                const decodedToken = verifyToken({
                    token: splittedToken,
                    signature: process.env.LOGIN_SECRET_KEY
                })
                console.log({ decodedToken: decodedToken })
                if (!decodedToken) {
                    return next(new Error('invalid token', { cause: 400 }))
                }
                if (!decodedToken._id) {
                    return next(new Error('critical token data is missing!', { cause: 400 }))
                }
                console.log("\nAUTHENTICATION IS SUCCESSFULL\n")
                console.log("\nAUTHORIZATION\n")
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
                console.log("\nAUTHORIZATION IS SUCCESSFULL\n")
                req.authUser = getUser
                next()
            } catch (error) {
                console.log("\nTOKEN REFRESHING\n")
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
                    console.log({ User_new_token: newToken })
                    user.token = newToken
                    await user.save()
                    req.authUser = user
                    console.log("\nTOKEN REFRESHING IS SUCCESSFULL\n")
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