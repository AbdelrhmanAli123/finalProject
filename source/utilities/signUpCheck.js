import { touristModel } from "../dataBase/models/tourist.model.js"
import { tourGuideModel } from "../dataBase/models/tourGuide.model.js"

export const checkUserExists = async (email) => {
    const result = {
        message: 'user email is valid',
        found: false
    }
    const isFoundTourist = await touristModel.findOne({ email })

    if (isFoundTourist) {
        console.log({ message: "there is a tourist account found" })
        console.log({
            user_error_message: "there is an account with the entered email",
            entered_email: email,
            found_account_email: isFoundTourist.email
        })
        result.message = `user email already exists!`
        result.found = true
        return result
    }

    const isFoundTourGuide = await tourGuideModel.findOne({ email: email })

    if (isFoundTourGuide) {
        console.log({ message: "there is a tourGuide account found" })
        console.log({
            user_error_message: "there is an account with the entered email",
            entered_email: email,
            found_account_email: isFoundTourGuide.email
        })
        result.message = `user email already exists!`
        result.found = true
        return result
    }
    return result
}
// if (findUser?.email === email) {
//     console.log({
//         api_error_message: "user shouldn't be found!",
//         user: findUser
//     })
//     return next(new Error('email already exists!', { cause: 400 }))
// } else if (findUser?.userName === userName) {
//     console.log({
//         api_error_message: "username duplication!",
//         req_body_username: userName,
//         existing_username: findUser?.userName
//     })
//     return next(new Error('userName already exists!', { cause: 400 }))
// }