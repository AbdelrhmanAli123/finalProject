import { request } from 'express'
import fs from 'fs'
import {
    bcrypt, cloudinary, touristModel, slugify, generateToken, verifyToken, customAlphabet, emailService,
    ReasonPhrases, StatusCodes, systemRoles, EGphoneCodes, languages, statuses,
    languagesCodes, countries, countriesCodes, axios, historicMP_Model
} from './tourist.controller.imports.js'
// for tourist sign up :
const nanoid = customAlphabet('asdfghjkl123456789_#$%!', 5)
// for password reset :
const nanoid2 = customAlphabet('1234567890', 6)

// TODO : edit all APIs' responses (what you show for the front) , status codes , reasonPhrases
// TODO : change the database URL after testing
// TODO : find a two-way encryption module that can be used in both node.js + flutter

export const TouristSignUp = async (req, res, next) => {

    console.log("\nTOURIST SIGN UP API\n")

    const {
        userName, email, password, confirmPassword
    } = req.body

    const findUser = await touristModel.findOne({ $or: [{ email: email }, { userName: userName }] })
    console.log({ user_Found: findUser })

    if (findUser?.email === email) {
        console.log({
            api_error_message: "user shouldn't be found!",
            user: findUser
        })
        return next(new Error('email already exists!', { cause: 400 }))
    } else if (findUser?.userName === userName) {
        console.log({
            api_error_message: "username duplication!",
            req_body_username: userName,
            existing_username: findUser?.userName
        })
        return next(new Error('userName already exists!', { cause: 400 }))
    }

    if (password !== confirmPassword) {
        console.log({
            api_error_message: "password duplication!",
            req_body_password: password,
            existing_password: findUser?.password
        })
        return next(new Error("passwords don't match!", { cause: 400 }))
    }

    const slug = slugify(userName, '_')
    console.log({
        message: "slugging done!",
        plain_name: userName,
        sluggified_name: slug
    })

    const userData = {
        userName,
        email,
        slug,
        // address
    }
    console.log({
        message: "email , userName and slug are done!"
    })

    const hashedPassword = bcrypt.hashSync(password, +process.env.SIGN_UP_SALT_ROUNDS)
    userData.password = hashedPassword
    console.log({
        message: "password encryption done!",
    })

    const saveUser = await touristModel.create(userData)
    if (!saveUser) {
        console.log({
            api_error_message: "couldn't save the user in the data base , SERVER ERROR"
        })
        await cloudinary.uploader.destroy(profilePic?.public_id)
        await cloudinary.uploader.destroy(coverPic?.public_id)
        return next(new Error("couldn't save the user in the data base !", { cause: 500 }))
    }

    const token = generateToken({
        expiresIn: '3w',
        signature: process.env.LOGIN_SECRET_KEY,
        payload: {
            _id: saveUser._id,
            email: saveUser.email,
            userName: saveUser.userName,
            role: systemRoles.tourist
        }
    })
    console.log({ message: "user token generated!" })

    saveUser.token = token
    saveUser.status = statuses.online
    await saveUser.save()
    console.log({ message: "user saved and is online!" })

    const confirmToken = generateToken({ payload: { email }, signature: process.env.CONFIRM_LINK_SECRETE_KEY, expiresIn: '1h' })
    // `${req.protocol}://${req.headers.host}:${process.env.PORT}/user/confirmEmail/${EmailConfirmToken}`
    console.log({ message: "account confirmation token generated!" })

    // TODO : you might add a '/' before 'confirmToken'
    console.log(`req destination host:${req.headers.host}`)
    const confirmLink = `${req.protocol}://${req.headers.host}/tourist/confirmAccount${confirmToken}`
    const message = `<a href = ${confirmLink} >PLEASE USE THIS LINK TO CONFIRM YOUR EMAIL !</a>`
    const subject = 'Email confirmation'
    const sendEMail = emailService({ message, to: email, subject })
    if (!sendEMail) {
        console.log({
            api_error_message: "account confirmation email sending failure!"
        })
        return next(new Error('sending email failed!', { cause: 500 }))
    }

    console.log("\nTOURIST SIGN UP IS DONE!\n")
    res.status(StatusCodes.CREATED).json({
        message: "user added!",
        user: saveUser
    })
}

export const confirmAccount = async (req, res, next) => {
    console.log("\nTOURIST ACCOUNT CONFIRMATION API\n")

    const { confirmToken } = req.params

    const decodeToken = verifyToken({ token: confirmToken, signature: process.env.CONFIRM_LINK_SECRETE_KEY })
    console.log({
        message: "confirmation token is decoded!",
        confirmation_token: decodeToken
    })
    if (!decodeToken) {
        console.log({
            api_error_message: "failed to decode the confirmation token"
        })
        return next(new Error('failed to decode the confirmation token!', { cause: 400 }))
    }

    const getUser = await touristModel.findOne({ email: decodeToken?.email })
    console.log({ user_fetching_errors: getUser?.errors })
    if (!getUser) {
        console.log({
            api_error_message: "failed to fetch the user!",
        })
        return next(new Error('failed to find user!', { cause: 500 }))
    }
    console.log({
        message: "user fetched!",
        fetched_user: getUser
    })

    // the reason that this API on cloud gets this response always is that it sends the request twice by itslef
    // but it still works and not always has the request for hit twice , sometimes it hit once and it does work
    if (getUser.confirmed === true) {
        console.log({
            message: "user is already confirmed!",
            is_user_confirmed: getUser.confirmed
        })
        return next(new Error('user is already confirmed!', { cause: 400 }))
    }

    getUser.confirmed = true
    console.log("user is confirmed!")

    getUser.save()
    console.log("user is saved!")

    console.log("\nTOURIST ACCOUNT CONFIRMATION IS DONE\n")
    res.status(200).json({
        message: "confirmation done!",
        user: getUser
    })
}

export const touristLogIn = async (req, res, next) => {
    console.log("\nTOURIST LOGIN API\n")

    const { email, password } = req.body

    const getUser = await touristModel.findOne({ email })
    console.log({ user_fetching_errors: getUser?.errors })
    if (!getUser) {
        console.log({
            user_error_message: "login email is invalid!"
        })
        return next(new Error('invalid login credentials', { cause: 400 }))
    }
    console.log({
        message: "user is found!",
        user: getUser
    })

    const isPassMatch = bcrypt.compareSync(password, getUser.password)
    console.log({
        is_password_valid: isPassMatch
    })
    if (!isPassMatch) {
        console.log({
            user_error_message: "login password is invalid!"
        })
        return next(new Error('your email or password is wrong!', { cause: 400 }))
    }

    const token = generateToken({
        expiresIn: '3w',
        signature: process.env.LOGIN_SECRET_KEY,
        payload: {
            _id: getUser._id,
            email: getUser.email,
            userName: getUser.userName,
            role: systemRoles.tourist
        }
    })
    if (!token) {
        console.log({
            api_error_message: "failed to generate user token!",
        })
        return next(new Error('failed to generate user token', { cause: 500 }))
    }
    console.log({
        message: "user token is generated!"
    })

    const updateUser = await touristModel.findOneAndUpdate({ email }, { status: statuses.online, token }, { new: true }).select('userName email token')
    console.log({ user_updating_errors: updateUser?.errors })
    if (!updateUser) {
        console.log({
            api_error_message: "failed to generate user token!",
        })
        return next(new Error('failed to login the user!', { cause: 500 }))
    }
    console.log({
        message: "user is now online!",
        logged_in_user: updateUser
    })

    console.log("\nTOURIST LOGIN IS DONE!\n")
    res.status(200).json({
        message: "login is successfull!",
        user: updateUser
    })
}

// TODO : first make this api for tourists only , then make it for tourGuides and other roles 
export const forgetPassword = async (req, res, next) => {
    // this api occurs at the login page , doesn't need a token nor entering a password
    console.log("\nTOURIST FORGET PASSWORD API\n")
    const { email } = req.body

    const getUser = await touristModel.findOne({ email })
    console.log({ user_fetching_errors: getUser?.errors })
    if (!getUser) {
        console.log({
            api_error_message: "failed to fetch the user!",
        })
        return next(new Error('invalid email', { cause: 400 }))
    }
    console.log({
        message: "user fetched!",
        fetched_user: getUser
    })

    const code = nanoid2() // reset code generated
    console.log("reset code generated!")
    const hashedCode = bcrypt.hashSync(code, +process.env.FORGET_PASSWORD_CODE_SALT) // reset code hashed
    console.log("reset code hashed!")

    // we need this token to get the user Data from database in the reset password api
    const token = generateToken({
        payload: {
            email,
            resetCode: hashedCode
        },
        signature: process.env.reset_password_secret_key,
        expiresIn: '300s'
    })
    if (!token) {
        console.log({
            api_error_message: "failed to generate password reset token!",
        })
        return next(new Error('failed to generate password reset token', { cause: 500 }))
    }
    console.log({
        message: "password reset token is generated!"
    })

    // const resetPassLink = `${req.protocol}://${req.headers.host}/tourist/resetPassword${token}`
    const resetEmail = emailService({
        to: email,
        subject: 'Reset password',
        message: ` <h1>use this code below to reset your password in you app</h1>
                <p>${code}</p>`
    })
    if (!resetEmail) {
        console.log({
            api_error_message: "failed to send password reset email!",
        })
        return next(new Error('failed to send password reset email!', { cause: 400 }))
    }
    console.log({
        message: "password reset email sent!",
        reset_email: resetEmail
    })

    const updateUser = await touristModel.findOneAndUpdate({ email }, { resetCode: hashedCode, forgetPassword: true }, { new: true })
    console.log({ user_updating_errors: updateUser?.errors })
    if (!updateUser) {
        console.log({
            api_error_message: "failed to forget user password!",
        })
        return next(new Error('failed to forget password!', { cause: 400 }))
    }
    console.log({
        message: "password is now forgotten!"
    })

    // TODO : in the response , the 'resetCode' must be hashed or encrypted for the front end also and the front end can take that and dehash it
    console.log("\nTOURIST FORGET PASSWORD IS DONE!\n")
    res.status(200).json({
        message: "forget password done!",
        token,
        resetCode: code
    })
}

export const resetPassword = async (req, res, next) => {
    console.log("\nTOURIST PASSWORD RESET API\n")
    const { token } = req.params
    const { newPassword } = req.body

    let decodedToken
    try {
        decodedToken = verifyToken({
            token,
            signature: process.env.reset_password_secret_key
        })
    } catch (error) {
        console.log({
            api_error_message: "token decoding error",
            JWTerrorName: error.name,
            JWTerrorMessage: error.message
        })
        if (error.name === 'TokenExpiredError') {
            return next(new Error('reset code expired!', { cause: 408 }))
        }
    }
    if (!decodedToken) {
        console.log({
            api_error_message: "token decoding failure"
        })
        return next(new Error('failed to decode the token', { cause: 400 }))
    }
    console.log({
        message: "token decoded!",
        decoded_token: decodedToken
    })
    // if (decodedToken.Error.message === 'TokenExpiredError') {
    //     return next(new Error('reset code expired!', { cause: 408 }))
    // }

    const getUser = await touristModel.findOne({
        email: decodedToken.email,
    })
    console.log({ user_fetching_errors: getUser?.errors })
    if (!getUser) {
        console.log({
            api_error_message: "failed to find user!"
        })
        return next(new Error('failed to find user', { cause: 400 }))
    }
    if (decodedToken.resetCode !== getUser.resetCode) {
        console.log({
            api_error_message: "invalid reset code!"
        })
        return next(new Error('invalid reset code!', { cause: 400 }))
    }
    console.log({
        message: "user found!",
        user: getUser
    })

    const isPassMatch = await bcrypt.compare(newPassword, getUser.password)
    if (isPassMatch) {
        console.log({
            api_error_message: "new password duplicate",
            old_password: getUser.password,
            entered_new_password: newPassword
        })
        return next(new Error('enter a different password', { cause: 400 }))
    }
    console.log({
        message: "passwords match!",
        resetPasswordMatch: isPassMatch
    })

    const hashedNewPassword = bcrypt.hashSync(newPassword, +process.env.reset_password_salt)
    if (!hashedNewPassword) {
        console.log({
            api_error_message: "failure in hashing the new password"
        })
        return next(new Error('failed to hash the new password', { cause: 500 }))
    }
    getUser.password = hashedNewPassword
    console.log({
        message: "new password added!",
    })

    getUser.resetCode = null
    getUser.forgetPassword = false
    getUser.__v++
    console.log({
        message: "resetCode , forgetPassword are now back to default and version is incremented!"
    })

    if (!await getUser.save()) {
        console.log({
            api_error_message: "failed to save user changes in data base!"
        })
        return next(new Error('failed to reset password in data base', { cause: 500 }))
    }
    console.log({
        message: "user changes are saved in data base!"
    })

    console.log("\nTOURIST PASSWORD RESET IS DONE!\n")
    res.status(200).json({
        message: "reset password done!",
    })
}

// tourist auth , tourGuide auth (ocr) .

// this api will be used for both first time profile setUp and profile update
export const profileSetUp = async (req, res, next) => {

    console.log("\nTOURIST PROFILE UPDATE/SETUP API\n")
    console.log({
        body: req.body,
        files: req.files
    })
    const _id = req?.authUser._id
    const { phoneNumber, gender, age, language, country, preferences, countryFlag } = req.body // front -> not in DB document

    const getUser = await touristModel.findById(_id)
    if (!getUser) {
        console.log({
            api_error_message: "failed to fetch the user!",
        })
        return next(new Error("couldn't find user , invalid userID", { cause: 400 }))
    }
    console.log({
        message: "user found!",
        user_found: getUser
    })

    if (phoneNumber) {
        console.log({
            message: "phone number found in request!",
            phone_number: phoneNumber,
            phone_number_length: phoneNumber.length,
        })
        if (phoneNumber.length !== 10) {
            console.log({
                user_error_message: "user didn't enter a valid phone number length",
                required_length: "10",
                entered_length: phoneNumber.length
            })
            return next(new Error("enter a valid phone number!", { cause: 400 }))
        }
        if (!EGphoneCodes.includes(phoneNumber.slice(0, 2))) {
            console.log({
                user_error_message: "user didn't enter a valid phone number code",
                valid_codes: "10 || 11 || 12 || 15",
                entered_code: phoneNumber.slice(0, 2)
            })
            return next(new Error("please enter an egyptian number!", { cause: 400 }))
        }
        getUser.phoneNumber = phoneNumber
        console.log({ message: "phone number updated!" })
    }

    if (gender) {
        console.log({
            message: "gender found in request!",
            entered_gender: gender
        })
        if (gender !== 'male' && gender !== 'female' && gender !== 'not specified') {
            console.log({
                user_error_message: "user entered an invalid gender",
                available_genders: "male || female || not specified",
                entered_gender: gender
            })
            return next(new Error('invalid gender!', { cause: 400 }))
        }
        getUser.gender = gender
        console.log({ message: "gender is updated!" })
    }

    if (country) {
        console.log({
            message: "country found in request!",
            country_entered: country
        })
        getUser.country = country
        console.log({ message: "country is updated!" })
    }

    if (age) {
        console.log({
            message: "age found in request!",
            enetered_age: age
        })
        getUser.age = age
        console.log({ message: "age updated!" })
    }

    if (language) {
        console.log({
            message: "language found in request!",
            enetered_language: language
        })
        getUser.language = language
        console.log({ message: "language updated!" })
    }

    if (preferences) {
        console.log({
            message: "preferences are found in request!",
            enetered_preferences: preferences
        })
        getUser.preferences = preferences
        console.log({ message: "preferences updated!" })
    }

    if (countryFlag) {
        console.log({
            message: "country flage found in request!",
            enetered_countryFlag: countryFlag
        })
        getUser.countryFlag = countryFlag
        console.log({ message: "country flag is updated!" })
    }

    let profilePic, coverPic
    let profileUploadPath // for profile Picture
    let coverUploadPath // for cover picture
    if (req.files) {
        console.log({
            message: "files are found in request!",
            files: req.files,
            profileArray: req.files['profilePicture'],
            coverArray: req.files['coverPicture']
        })
        // we can either make a new customId for the usesd document or not , it may be better for security
        let customId
        let flag = false
        if (getUser.customId) { // if you have a custom id then you surely have uploaded images before
            console.log({
                message: "user has a custom id and maybe has uploaded an image before",
                existing_customId: getUser.customId
            })
            customId = getUser.customId
        }
        else { // else meanse that you don't have
            customId = nanoid()
            getUser.customId = customId
            console.log({
                message: "user didn't have a custom id and maybe didn't upload an image before",
                created_customId: customId
            })
            flag = true
        }
        profileUploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/profilePicture`
        coverUploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/coverPicture`
        for (const array in req.files) { // this gets the names of the arrays not the arrays them selves
            console.log({
                message: `the "${array}" array is accessed!`,
                iteration_array_name: array,
                type_of_iteration_array: typeof (array),
                iteration_array: req.files[array]
            })
            const arrayFields = req.files[array] // this should access the first array of req.files
            for (const file of arrayFields) { // each object of the array inside the object
                if (file.fieldname === 'profilePicture') {
                    console.log({
                        profile_picture_accessed: true,
                        accessed_file: file
                    })
                    let isFileExists
                    try {
                        isFileExists = await cloudinary.api.resource(getUser.profilePicture?.public_id)
                    } catch (error) {
                        console.log({
                            message: "file isn't found!",
                            error: error
                        })
                    }
                    if (isFileExists) { // if there is a file
                        console.log({
                            existing_file_to_be_deleted: isFileExists
                        })
                        await cloudinary.api.delete_resources_by_prefix(profileUploadPath)
                            .then(() => console.log({ message: "profile picture deleted!", profilePicDeleted: true }))
                            .catch(async (err) => {
                                console.log({
                                    message: "failed to delete profile picture",
                                    error: err
                                })
                            })
                        await cloudinary.api.delete_folder(profileUploadPath)
                            .then(() => console.log({ message: "profile picture folder deleted!" }))
                            .catch(async (err) => {
                                console.log({
                                    message: "failed to delete profile picture folder!",
                                    error: err
                                })
                            })
                    }
                    const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                        folder: profileUploadPath
                    })
                    if (!secure_url || !public_id) {
                        console.log({ message: "failed to upload the profile picture!" })
                        return next(new Error("couldn't upload the profile picture!", { cause: 400 }))
                    }
                    console.log({ message: "profile picture uploaded!" })
                    profilePic = { secure_url, public_id }
                    getUser.profilePicture = profilePic
                    console.log({ message: "profile picture is updated!" })
                } else if (file.fieldname === 'coverPicture') {
                    console.log({
                        cover_picture_accessed: true,
                        accessed_file: file
                    })
                    let isFileExists
                    try {
                        isFileExists = await cloudinary.api.resource(getUser.coverPicture?.public_id)
                    } catch (error) {
                        console.log({
                            message: "file isn't found!",
                            error: error
                        })
                    }
                    if (isFileExists) { // if there is a file
                        console.log({
                            existing_file_to_be_deleted: isFileExists
                        })
                        await cloudinary.api.delete_resources_by_prefix(coverUploadPath)
                            .then(() => console.log({ message: "cover picture deleted!", coverPicDeleted: true }))
                            .catch(async (err) => {
                                console.log({
                                    message: "failed to delete cover picture",
                                    error: err
                                })
                            })
                        await cloudinary.api.delete_folder(coverUploadPath)
                            .then(() => console.log({ message: "cover picture folder deleted!" }))
                            .catch(async (err) => {
                                console.log({
                                    message: "failed to delete cover picture folder!",
                                    error: err
                                })
                            })
                    }
                    const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                        folder: coverUploadPath
                    })
                    if (!secure_url || !public_id) {
                        console.log({ message: "failed to upload the cover picture!" })
                        return next(new Error("couldn't upload the cover picture!", { cause: 400 }))
                    }
                    console.log({ message: "cover picture uploaded!" })
                    coverPic = { secure_url, public_id }
                    getUser.coverPicture = coverPic
                    console.log({ message: "cover picture is updated!" })
                } else {
                    console.log({ user_error_message: "user enetered invalid field name!" })
                    return next(new Error('invalid file field name!', { cause: 400 }))
                }
            }
        }
    }
    profilePic = null
    coverPic = null
    profileUploadPath = null
    coverUploadPath = null


    req.profileImgPath = profileUploadPath
    req.coverImgPath = coverUploadPath


    if (!await getUser.save()) {
        console.log({ api_error_message: "failed to save user updates!" })
        return next(new Error("couldn't update the user in database!", { cause: 500 }))
    }
    console.log({ message: "user updates saved!" })
    getUser.__v++

    console.log("\nTOURIST PROFILE SETUP/UPDATE DONE!\n")
    res.status(200).json({
        message: "your profile updating is completed!",
        user: getUser
    })
}


export const logOut = async (req, res, next) => {
    console.log("\nTOURIST LOGOUT API\n")
    const { _id } = req.authUser

    const getUser = await touristModel.findById(_id)
    if (!getUser) {
        console.log({ api_error_message: "user id not found!" })
        return next(new Error('user not found!', { cause: 400 }))
    }
    console.log({
        message: "user is found!",
        user_found: getUser
    })

    getUser.token = null
    getUser.status = statuses.offline
    console.log({ message: "user is now offline!" })

    if (!await getUser.save()) {
        console.log({ api_error_message: "failed to logout the user" })
        return next(new Error('failed to logout the user!', { cause: 400 }))
    }
    console.log({ message: "user is logged out!" })

    console.log("\nTOURIST LOGOUT IS DONE!\n")
    res.status(200).json({
        message: "logout is successfull!"
    })
}

// TODO : check the await .then() .catch() activity 
export const deleteUser = async (req, res, next) => {
    console.log("\nTOURIST DELETE API\n")
    const { _id } = req.authUser

    const getUser = await touristModel.findById(_id)
    if (!getUser) {
        console.log({ api_error_message: "user is not found!" })
        return next(new Error('user not found!', { cause: 400 }))
    }
    console.log({
        message: "user is found!",
        user_found: getUser
    })

    let customId = getUser.customId
    let userProfilePath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/profilePicture`
    let userCoverPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/coverPicture`
    let userFolderPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}`
    let profilePublicId = getUser.profilePicture?.public_id
    let coverPictureId = getUser.coverPicture?.public_id

    // we need to delete the user's images and folders on cloudinary :
    console.log({ message: "about to delete user assets!" })

    console.log({ message: "about to delete user profile picture!" })
    await cloudinary.api.resource(getUser.profilePicture?.public_id)
        .then(async () => {
            await cloudinary.api.delete_resources_by_prefix(userProfilePath)
                .then(() => console.log({ message: "profile picture is deleted!" }))
                .catch((err) => console.log({ api_error_message: "failed to delete profile picture!" }))

            await cloudinary.api.delete_folder(userProfilePath)
                .then(() => console.log({ message: "profile picture folder is deleted!" }))
                .catch((err) => console.log({ api_error_message: "failed to delete profile picture folder!" }))
        })
        .catch((err) => {
            console.log({
                api_error_message: "profile picture is not found!",
                err: err
            })
        })

    console.log({ message: "about to delete user cover picture!" })
    await cloudinary.api.resource(getUser.coverPicture?.public_id)
        .then(async () => {
            await cloudinary.api.delete_resources_by_prefix(userCoverPath)
                .then(() => console.log({ message: "cover picture is deleted!" }))
                .catch((err) => console.log({ api_error_message: "failed to delete cover picture!" }))

            await cloudinary.api.delete_folder(userCoverPath)
                .then(() => console.log({ message: "cover picture folder is deleted!" }))
                .catch((err) => console.log({ api_error_message: "failed to delete cover picture folder!" }))
        })
        .catch((err) => {
            console.log({
                api_error_message: "cover picture is not found!",
                err: err
            })
        })

    console.log({ message: "about to delete user main folder!" })
    await cloudinary.api.delete_folder(userFolderPath)
        .then(() => console.log({ message: "user main folder is deleted!" }))
        .catch((err) => console.log({ api_error_message: "failed to delete the user's main folder!" }))


    const deleteUser = await touristModel.findByIdAndDelete(_id)
    if (!deleteUser) {
        console.log({ api_error_message: "failed to delete the user , attempting to restore the images!" })
        // restoring the profile picture
        await cloudinary.api.create_folder(userProfilePath, { resource_type: 'raw' })
            .then(async () => {
                console.log({ message: "user profile picture folder restored!" })
                await cloudinary.api.restore(profilePublicId)
                    .then(() => console.log({ message: "profile picture is restored!" }))
                    .catch(async (err) => {
                        console.log({
                            message: "failed to restore the profile picture!",
                            error: err
                        })
                        await cloudinary.api.delete_folder(userFolderPath)
                            .then(() => console.log({ message: "user folder is deleted!" }))
                            .catch((err) => console.log({ api_error_message: "failed to delete user folder!" }))
                    })
            })
            .catch((err) => console.log({
                api_error_message: "failed to restore the profile picture",
                error: err
            }))

        await cloudinary.api.create_folder(userCoverPath, { resource_type: 'raw' })
            .then(async () => {
                console.log({ message: "user cover picture folder restored!" })
                await cloudinary.api.restore(coverPictureId)
                    .then(() => console.log({ message: "cover picture is restored!" }))
                    .catch(async (err) => {
                        console.log({
                            message: "failed to restore the cover picture!",
                            error: err
                        })
                        await cloudinary.api.delete_folder(userFolderPath)
                            .then(() => console.log({ message: "user folder is deleted!" }))
                            .catch((err) => console.log({ api_error_message: "failed to delete user folder!" }))
                    })
            })
            .catch((err) => console.log({
                api_error_message: "failed to restore the profile picture",
                error: err
            }))
        customId = null
        userProfilePath = null
        userCoverPath = null
        userFolderPath = null
        return next(new Error("couldn't delete the user!", { cause: 500 }))
    }
    console.log({ message: "user is deleted!" })
    customId = null
    userProfilePath = null
    userCoverPath = null
    userFolderPath = null

    console.log("\nTOURIST DELETE IS DONE!\n")
    res.status(200).json({
        message: "User deleted successfully!",
        token: deleteUser.token
    })
}

export const getUserInfo = async (req, res, next) => {
    console.log("\nTOURIST GET USER INFO API\n")
    const { _id } = req.authUser
    const getUser = await touristModel.findById(_id)
        .select('userName email gender age phoneNumber language profilePicture.secure_url coverPicture.secure_url status confirmed country countryFlag preferences')
    if (!getUser) {
        console.log({ api_error_message: "failed to find the user!" })
        return next(new Error('user not found!', { cause: 400 }))
    }
    console.log({
        message: "user is found!",
        user_found: getUser
    })

    console.log("\nTOURIST GET USER INFO IS DONE!\n")
    res.status(200).json({
        message: "user fetching is successfull!",
        user: getUser
    })
}

// DEPRICATED API
export const changePassword = async (req, res, next) => {
    console.log("\nTOURIST (DEPRICATED) CHANGE PASSWORD API\n")
    const { _id } = req.authUser
    const { oldPassword, newPassword, confirmNewPassword } = req.body
    if (!oldPassword || !newPassword || !confirmNewPassword) {
        return next(new Error("passwords are missing!", { cause: 411 }))
    }
    if (newPassword !== confirmNewPassword) {
        return next(new Error('passwords must match!', { cause: 400 }))
    }
    const hashedNewPassword = bcrypt.hashSync(newPassword, +process.env.SIGN_UP_SALT_ROUNDS)
    const getUser = await touristModel.findOne({
        _id,
    })
    if (!getUser) {
        return next(new Error('user not found!', { cause: 400 }))
    }
    const isPassMatch = bcrypt.compareSync(oldPassword, getUser.password)
    if (!isPassMatch) {
        return next(new Error('invalid old password!', { cause: 400 }))
    }
    getUser.password = hashedNewPassword
    getUser.__v++
    if (!await getUser.save()) {
        return next(new Error("couldn't change password", { cause: 500 }))
    }
    res.status(200).json({
        message: "changing password is successfull!",
        userToken: getUser.token
    })
}

export const confrirmOldPass = async (req, res, next) => {
    console.log("\nTOURIST CONFIRM OLD PASS API\n")
    const { _id } = req.authUser
    const { oldPassword } = req.body

    if (!oldPassword) {
        console.log({
            user_error_message: "password is missing",
            entered_password: oldPassword,
            purpose: "confirm current password!"
        })
        return next(new Error('old password must be entered!', { cause: 400 }))
    }
    console.log({ message: "password is found!" })

    const getUser = await touristModel.findById(_id)
    if (!getUser) {
        console.log({ api_error_message: "user is not found!" })
        return next(new Error('user not found , invalid userID', { cause: 400 }))
    }
    console.log({
        message: "user is found!",
        user_found: getUser
    })

    // this line will fail if the stored password in the data base is not hashed because bcrypt will hash it anyways then compare it
    const isPassMatch = bcrypt.compareSync(oldPassword, getUser.password)
    console.log({ is_password_valid: isPassMatch })
    if (!isPassMatch) {
        console.log({ user_error_message: "user entered incorrect password!" })
        return next(new Error("incorrect password!", { cause: 400 }))
    }
    console.log({ message: "the entered password is correct!" })

    console.log("\nTOURIST CONFIRM OLD PASS IS DONE!\n")
    res.status(200).json({
        message: "you can continue to change your password!"
    })
}

export const changeOldPass = async (req, res, next) => {
    console.log("\nTOURIST CHANGE PASSWORD API\n")
    const { _id } = req.authUser
    const { newPassword, confirmNewPassword } = req.body

    if (!newPassword) {
        console.log({ user_error_message: "new password is missing!" })
        return next(new Error('you must enter the new Password!', { cause: 400 }))
    }
    console.log({ message: "new password is found!" })
    if (!confirmNewPassword) {
        console.log({ user_error_message: "confirm new password is missing!" })
        return next(new Error('you must confirm the new Password!', { cause: 400 }))
    }
    console.log({ message: "confirm new password is found!" })

    if (newPassword !== confirmNewPassword) {
        console.log({
            user_error_message: "the user entered 2 non-matching passwords",
            entered_new_password: newPassword,
            entered_confirm_new_password: confirmNewPassword
        })
        return next(new Error('passwords must match!', { cause: 400 }))
    }
    console.log({ message: "the 2 entered passwords matched!" })

    const getUser = await touristModel.findById(_id)
    if (!getUser) {
        console.log({ api_error_message: "user not found!" })
        return next(new Error("couldn't find the user , invalid userID!", { cause: 400 }))
    }
    console.log({
        message: "user found!",
        user_found: getUser
    })

    const isPassMatch = bcrypt.compareSync(newPassword, getUser.password)
    console.log({ is_new_pass_matches_old: isPassMatch })
    if (isPassMatch) {
        console.log({ user_error_message: "user entered the same password as the old one!" })
        return next(new Error('you must enter a new Password!', { cause: 400 }))
    }
    console.log({ message: "the new password doesn't match the old one!" })

    const newHashedPassword = bcrypt.hashSync(newPassword, +process.env.SIGN_UP_SALT_ROUNDS)
    getUser.password = newHashedPassword
    console.log({ message: "new password is updated!" })

    if (!await getUser.save()) {
        console.log({ api_error_message: "failed to update the new password!" })
        return next(new Error('failed to save new password!', { cause: 500 }))
    }
    getUser.__v++
    console.log({ message: "user password is changed!" })

    console.log("\nTOURIST CHANGE PASSWORD IS DONE!\n")
    res.status(200).json({
        message: "changing password is successfull!"
    })
}

export const placeToggleFav = async (req, res, next) => {
    console.log("\nTOURIST TOGGLE TO FAVs API\n")
    // this API will either add the place to the favourites or remove it from it
    const { placeName } = req.body

    // check if the place is in the model or not
    const getPlace = await historicMP_Model.findOne({ name: placeName })
    if (!getPlace) {
        console.log({ user_error_message: "place doesn't exist" })
        return next(new Error("place doesn't exist", { cause: StatusCodes.BAD_REQUEST }))
    }
    if (getPlace.errors) {
        console.log({ api_error_message: "internal error finding the place" })
        return next(new Error("internal error finding the place", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    console.log({
        message: "place is found!",
        place_data: getPlace
    })

    // if the user has a favouritePlaces from the first place :
    if (req.authUser.favouritePlaces) {
        // if the place was already in the tourist's favourits -> remove it
        if (req.authUser.favouritePlaces.includes(getPlace._id)) {
            console.log({ message: "place is in user favs, removing it..." })
            req.authUser.favouritePlaces = req.authUser.favouritePlaces.filter(placeId => placeId.toString() !== getPlace._id.toString())
            console.log({ message: "place is removed from the favourites" })
        }
        // if the place is not in the user favs -> add it
        else if (!req.authUser.favouritePlaces.includes(getPlace._id)) {
            console.log({ message: "place is not in the user favs , adding it..." })
            req.authUser.favouritePlaces.push(getPlace._id)
            console.log({ message: "place added to the user favs successfully" })
        }
    } else { // if the user had no favouritePlaces field -> add one in it
        console.log({ message: "user had no place in his favs , adding one..." })
        req.authUser.favouritePlaces.push(getPlace._id)
        console.log({ message: "place added to the user favs successfully" })
    }

    try {
        await req.authUser.save()
        console.log({ message: "user updates are saved successfully!" })
    } catch (error) {
        console.log({
            error_message: "failed to save user updates!",
            error: error
        })
        return next(new Error(`failed to save user updates! , ${error}`, { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }

    console.log("\n\nTOURIST TOGGLE TO FAVs API DONE\n")
    res.status(StatusCodes.OK).json({
        message: "user favourites are updated!",
        favourites: req.authUser.favouritePlaces
    })
}

export const getAllFavPlaces = async (req, res, next) => {
    console.log("\nTOURIST GET ALL FAVOURITE PLACES API\n")

    const { _id } = req.authUser

    const getUser = await touristModel.findById(_id)
        .populate([
            {
                path: 'favouritePlaces'
            }
        ]).select('favouritePlaces')
    if (!getUser) {
        console.log({ user_error_message: "user is not found!" })
        return next(new Error("user is not found!", { cause: StatusCodes.BAD_REQUEST }))
    }
    if (getUser.errors) {
        console.log({ api_error_message: "error finding the user!" })
        return next(new Error("error finding the user!", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    console.log({
        message: "user is found!",
        user: getUser
    })

    console.log("\nTOURIST GET ALL FAVOURITE PLACES API DONE!\n")
    res.status(StatusCodes.OK).json({
        message: "favourite places are found!",
        user_favouritePlaces: getUser
    })
}

export const test = async (req, res, next) => {
    const { _id } = req.authUser
    const getUser = await touristModel.findById(_id)
    if (!getUser) {
        return next(new Error("couldn't find the user", { cause: 400 }))
    }
    let profilePic, coverPic
    let profileUploadPath // for profile Picture
    let coverUploadPath // for cover picture
    if (req.files) {
        let customId
        let flag = false
        if (getUser.customId) { // if you have a custom id then you surely have uploaded images before
            customId = getUser.customId
        }
        else { // else meanse that you don't have
            customId = nanoid()
            getUser.customId = customId
            flag = true
        }
        profileUploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/profilePicture`
        coverUploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/coverPicture`
        for (const file of req.files) {
            if (file.fieldname === 'profilePicture') {
                console.log({ accessed: true })
                if (flag == false) {
                    await cloudinary.api.delete_resources_by_prefix(profileUploadPath)
                    await cloudinary.api.delete_folder(profileUploadPath)
                }
                console.log({ profilePicDeleted: true })
                const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                    folder: profileUploadPath
                })
                if (!secure_url || !public_id) {
                    return next(new Error("couldn't save the profile picture!", { cause: 400 }))
                }
                profilePic = { secure_url, public_id }
                getUser.profilePicture = profilePic
            } else if (file.fieldname === 'coverPicture') {
                console.log({ accessed: true })
                if (flag == false) {
                    await cloudinary.api.delete_resources_by_prefix(coverUploadPath)
                    await cloudinary.api.delete_folder(coverUploadPath)
                }
                console.log({ coverPicDeleted: true })
                const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                    folder: coverUploadPath
                })
                if (!secure_url || !public_id) {
                    return next(new Error("couldn't save the image!", { cause: 400 }))
                }
                coverPic = { secure_url, public_id }
                getUser.coverPicture = coverPic
            } else {
                return next(new Error('invalid file fieldName!', { cause: 400 }))
            }
        }
    }
    else {
        profilePic = null
        coverPic = null
        profileUploadPath = null
        coverUploadPath = null
    }

    req.profileImgPath = profileUploadPath
    req.coverImgPath = coverUploadPath

    getUser.__v++

    if (!await getUser.save()) {
        return next(new Error("couldn't update the user in database!", { cause: 500 }))
    }

    res.status(200).json({
        message: "(any) pictures update is successfull!",
        getUser
    })
}

export const test2 = async (req, res, next) => {
    const custom = nanoid()
    console.log(req.file)
    await cloudinary.uploader.upload(req.file.path, {
        folder: `test/${custom}/`
    })
    res.status(200).json({
        message: "file",
        file: req.file
    })
}

// const { languages } = req.body
// console.log({
//     message: "AI test is entered!"
// })
// const AiUrl = 'http://18.212.174.169:5000/process_image'
// // const input = {
// //     question
// // }
// const headers = {
//     'Content-Type': 'multipart/form-data'
// };

// let formData2
// const formData = new FormData() // this has headers
// if (req?.file) {
//     formData.append('image', req?.file)
//     // formData2.image = req.file.buffer
// }
// // formData.append('question', question)
// if (languages) {
//     formData.append('languages', languages)
//     // formData2.languages = languages
// }
// console.log({
//     formData
// })
// // console.log({
// //     message: "form data",
// //     form_data: formData
// // }

// let AIdata
// try {
//     const AIresult = await axios.post(AiUrl, formData, { headers })
//         .then(response => {
//             AIdata = response.data
//             console.log({
//                 message: "Ai model gave a response",
//                 // response: response,
//                 data: response.data
//                 // status: response.status,
//                 // status_text: response.statusText,
//                 // headers: response.headers,
//                 // config: response.config
//             })
//         })
//         .catch(error => {
//             console.log({
//                 axios_error: "error regarding the AI model",
//                 error: error.message,
//                 error_itself: error
//             })
//         })
// } catch (error) {
//     console.log({
//         message: "failed to send request to AI",
//         error: error
//     })
// }
// console.log({
//     message: "Ai result is successfull!",
//     AI_data: AIdata
// })
// res.status(200).json({
//     message: "Ai testing done",
//     AI_answer: AIdata
// })
export const AItest = async (req, res, next) => {
    const { languages } = req.body;
    const AiUrl = 'http://18.212.174.169:8080/process_image'

    const headers = {
        'Content-Type': 'multipart/form-data'
    };

    const formData = new FormData();
    // if (req?.file && req.file.buffer && req.file.originalname) {
    //     formData.append('image', req?.file.buffer, req?.file.originalname);
    // }
    if (languages) {
        formData.append('languages', languages);
    }


    let AI_response
    try {
        const response = await axios.post(AiUrl, formData, { headers });
        console.log({
            message: "Ai model gave a response",
            data: response.data
        });
        res.status(200).json({
            message: "Ai testing done",
            AI_answer: response.data
        });
    } catch (error) {
        console.log({
            axios_error: "error regarding the AI model",
            error: error.message,
            error_itself: error
        });
        res.status(500).json({
            message: "Failed to send request to AI",
            error: error.message
        });
    }
}

export const AItest2 = async (req, res, next) => {
    const { languages } = req.body
    console.log({
        message: "AI test is entered!"
    })
    const AiUrl = 'http://18.212.174.169:8081/process_image'
    const headers = {
        'Content-Type': 'multipart/form-data'
    };
    const options = {
        'method': 'POST',
        'url': AiUrl,
        'headers': { 'Content-Type': 'multipart/form-data' },
        formData: {
            'image': {
                'value': req?.file.originalPath,
                'options': {
                    'filename': req?.file.filename,
                    'contentType': null
                }
            },
            'languages': '["English", "Japanese"]'
        }
    };
    const AIdata = await request(options
        , function (error, response) {
            if (error) {
                return next(new Error('request error!', { cause: 400 }))
            }
            console.log({
                response: response
            })
        })
    res.status(200).json({
        message: "Ai testing done",
        AI_answer: AIdata
    })
}

// const fs = require('fs');
// const FormData = require('form-data');
// const axios = require('axios');

// // Assuming you have fs, FormData, and axios installed in your project

// const formData = new FormData();

// // Add the image file to the FormData
// formData.append('image', fs.createReadStream('/C:/Users/CompuMall/Downloads/WhatsApp Image 2023-12-22 at 11.21.24 PM.jpeg'));

// // Add the 'languages' field to the FormData
// formData.append('languages', '["English", "Japanese"]');

// // Make a POST request to yo



export const AItest3 = async (req, res, next) => {
    const { languages } = req.body
    let data = new FormData();
    if (req?.file?.buffer) {
        data.append('images', req?.file.buffer);
    }
    data.append('languages', languages);

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://18.212.174.169:5000/process_image',
        headers: {
            ...data.getHeaders()
        },
        data: data
    };

    axios.request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log(error);
        });
    res.status(200).json({
        message: "test is done!"
    })
}

export const AItest4 = async (req, res, next) => {
    console.log({
        message: "\nAI TEST4 API\n"
    })
    const { languages } = req.body

    const AIurl = 'http://18.212.174.169:8081/process_image'

    const headers = {
        'Content-Type': 'multipart/form-data'
    }

    console.log({
        request_body: req.body,
        file: req?.file
    })

    const formData = new FormData()
    console.log({
        created_form_data_before_addition: formData
    })
    if (req?.file && req?.file.buffer) {
        console.log({
            message: "image condition is entered!"
        })
        formData.append('image', req.file.buffer, { filename: req.file.originalname })
        console.log({
            created_form_data_after_adding_image: formData
        })
    } else {

        res.status(400).json({
            message: "No file in the request"
        });

        return; // Stop execution if there's no file
    }

    if (languages) {
        formData.append('languages', languages)
        console.log({
            created_form_data_after_adding_image: formData
        })
    }

    console.log({
        created_form_data: formData
    })

    let AIresult
    try {
        const AIresponse = await axios.postForm(AIurl, formData, { headers })
            .then(response => {
                console.log({
                    message: "OCR gave a response",
                    responseData: response.data
                })
                res.status(500).json({
                    message: "failed to get response from the model"
                })
            })
    } catch (error) {
        console.log({
            message: "failed to send the request",
            error: error.message
        })
        res.status(500).json({
            message: "failed to send the request"
        })
    }
}