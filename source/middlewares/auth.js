import { generateToken, verifyToken } from "../utilities/tokenFunctions.js"
import { touristModel } from "../dataBase/models/tourist.model.js"
import { tourGuideModel } from "../dataBase/models/tourGuide.model.js"
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
                if (!decodedToken.email) {
                    return next(new Error('critical token data is missing!', { cause: 400 }))
                }
                console.log("\nAUTHENTICATION IS SUCCESSFULL\n")
                console.log("\nAUTHORIZATION\n")
                let getUser // tourist or tourGuide or other 
                if (decodedToken.role === systemRoles.tourist) {
                    console.log({ message: "tourist authorization" })
                    getUser = await touristModel.findOne({
                        email: decodedToken.email
                    })
                    console.log({ message: "user is fetched!", user: getUser })
                    if (!getUser) {
                        console.log({ user_error_message: "user is not found!" })
                        return next(new Error('the tourist is not found!', { cause: 400 }))
                    }
                    if (getUser.status !== statuses.online) {
                        console.log({ user_error_message: "user is not online!" })
                        return next(new Error('the tourist must be logged in!', { cause: 400 }))
                    }
                    if (getUser.confirmed !== true) {
                        console.log({ user_error_message: "user is not confirmed!" })
                        return next(new Error('the tourist must be confirmed!', { cause: 400 }))
                    }
                    // this checks the authority of the user
                    if (!roles.includes(getUser.role)) {
                        console.log({ authorization_rejection_message: "user is not authorized!" })
                        return next(new Error('the tourist is un Authorized to access this API', { cause: 403 }))
                    }
                    console.log({ message: "user is authorized!" })
                }
                else if (decodedToken.role === systemRoles.tourGuide) {
                    console.log({ message: "tourGuide authorization" })
                    getUser = await tourGuideModel.findOne({
                        email: decodedToken.email
                    })
                    console.log({ message: "user is fetched!", user: getUser })
                    if (!getUser) {
                        console.log({ user_error_message: "user is not found!" })
                        return next(new Error('the tourGuide is not found!', { cause: 400 }))
                    }
                    if (getUser.status !== statuses.online) {
                        console.log({ user_error_message: "user is not online!" })
                        return next(new Error('the tourGuide must be logged in!', { cause: 400 }))
                    }
                    if (getUser.confirmed !== true) {
                        console.log({ user_error_message: "user is not confirmed!" })
                        return next(new Error('the tourGuide must be confirmed!', { cause: 400 }))
                    }
                    if (getUser.verified !== true) {
                        console.log({ user_error_message: "user is not verified!" })
                        return next(new Error('the tourGuide must be verified!', { cause: 400 }))
                    }
                    // this checks the authority of the user
                    if (!roles.includes(getUser.role)) {
                        console.log({ authorization_rejection_message: "user is not authorized!" })
                        return next(new Error('the tourGuide is un Authorized to access this API', { cause: 403 }))
                    }
                    console.log({ message: "user is authorized!" })
                }
                console.log("\nAUTHORIZATION IS SUCCESSFULL\n")
                req.authUser = getUser
                req.userRole = getUser.role
                next()
            } catch (error) {
                // console.log("\nTOKEN REFRESHING\n")
                if (error == 'TokenExpiredError: jwt expired') {
                    console.log({
                        token_error_message: "token is expired!",
                        token_error: error
                    })
                    // return next(new Error('token is expired , please sign in again!', { cause: 400 }))

                    // TODO : debugg
                    let user
                    if (decodedToken.role === systemRoles.tourist) {
                        user = await touristModel.findOne({
                            token: splittedToken
                        })
                        // if the token sent is wrong along with being expired :
                        if (!user) {
                            return next(new Error('invalid token', { cause: 400 }))
                        }
                    } else if (decodedToken.role === systemRoles.tourGuide) {
                        user = await tourGuideModel.findOne({
                            token: splittedToken
                        })
                        // if the token sent is wrong along with being expired :
                        if (!user) {
                            return next(new Error('invalid token', { cause: 400 }))
                        }
                    }
                    // generate a new token
                    const newToken = generateToken({
                        signature: process.env.LOGIN_SECRET_KEY,
                        expiresIn: '1d',
                        payload: {
                            email: user.email,
                            role: user.role
                        }
                    })
                    console.log({ User_new_token: newToken })
                    user.token = newToken
                    await user.save()
                    req.authUser = user
                    console.log("\nTOKEN REFRESHING IS SUCCESSFULL\n")
                    return res.status(401).json({
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