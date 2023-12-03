import { log } from 'console'
import {
    bcrypt, cloudinary, touristModel, slugify, generateToken, verifyToken, customAlphabet, emailService,
    ReasonPhrases, StatusCodes, systemRoles, EGphoneCodes, languages, statuses,
    languagesCodes, countries, countriesCodes
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
        userName, email, password, confirmPassword, phoneNumber, gender, age, language, country, countryFlag
    } = req.body

    const findUser = await touristModel.findOne({ $or: [{ email: email }, { userName: userName }] })
    console.log({ is_user_Found: findUser })

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

    // TODO : add the address to the object when you deal with addresses
    const userData = {
        userName,
        email,
        slug,
        // address
    }
    console.log({
        message: "email , userName and slug are done!"
    })

    let profilePic, coverPic
    let profileUploadPath // for profile Picture
    let coverUploadPath // for cover picture

    if (req.files) {
        console.log({
            files: req.files,
            filesType: typeof (req.files),
            filesobjectKeys: Object.keys(req.files),
        })
        console.log({
            profilePicture: req.files['profilePicture'],
            coverPicture: req.files['coverPicture']
        })

        const customId = nanoid()
        userData.customId = customId
        profileUploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/profilePicture`
        coverUploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/coverPicture`

        // TODO : fix this code and optimize it , you can either stick to nested loops , or single loops or without loops since you know that should be there
        for (const array in req.files) { // this gets the names of the arrays not the arrays them selves
            console.log({
                iterationArrayName: array,
                typeOfIterationArray: typeof (array)
            })
            // console.log({ arrayFieldName: array.fieldname }) // this will always gete undefined since array is a string that has no properties
            const arrayFields = req.files[array] // this should access the first array of req.files
            console.log({ iterationArray: arrayFields })
            for (const file of arrayFields) { // each object of the array inside the object
                if (file.fieldname === 'profilePicture') {
                    console.log({ accessed: true })
                    const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                        folder: profileUploadPath
                    })
                    if (!secure_url || !public_id) {
                        return next(new Error("couldn't save the profile picture!", { cause: 400 }))
                    }
                    profilePic = { secure_url, public_id }
                    userData.profilePicture = profilePic
                    console.log({
                        message: "profile picture is added!",
                        profile_pic_url: userData.profilePicture
                    })
                }
                else if (file.fieldname === 'coverPicture') {
                    console.log({ accessed: true })
                    const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                        folder: coverUploadPath
                    })
                    if (!secure_url || !public_id) {
                        return next(new Error("couldn't save the image!", { cause: 400 }))
                    }
                    coverPic = { secure_url, public_id }
                    userData.coverPicture = coverPic
                    console.log({
                        message: "cover picture is added!",
                        profile_pic_url: userData.coverPicture
                    })
                }
                else {
                    console.log({
                        message: "invalid file fieldname",
                        file_field_name: file.fieldname
                    })
                    return next(new Error('invalid file fieldName!', { cause: 400 }))
                }
            }
        }
    } else {
        profilePic = null
        coverPic = null
        profileUploadPath = null
        coverUploadPath = null
    }

    req.profileImgPath = profileUploadPath
    req.coverImgPath = coverUploadPath

    const hashedPassword = bcrypt.hashSync(password, +process.env.SIGN_UP_SALT_ROUNDS)
    userData.password = hashedPassword
    console.log({
        message: "password encryption done!",
    })

    if (age) {
        userData.age = age
        console.log({
            message: "age added!"
        })
    }

    if (gender) {
        if (gender !== 'male' && gender !== 'female' && gender !== 'not specified') {
            return next(new Error('invalid gender!', { cause: 400 }))
        }
        userData.gender = gender
        console.log({
            message: "gender added!"
        })
    }

    if (language) {
        if (!languages.includes(language)) {
            return next(new Error("please enter a valid language!", { cause: 400 }))
        }
        userData.language = language
        console.log({
            message: "language added!"
        })
    }

    if (phoneNumber) {
        console.log({
            length: phoneNumber.length
        })
        if (phoneNumber.length !== 10) {
            console.log({
                api_error_message: "invalid phone number length",
                phone_length: phoneNumber.length
            })
            return next(new Error("enter a valid phone number!", { cause: 400 }))
        }
        if (!EGphoneCodes.includes(phoneNumber.substring(0, 2))) {
            console.log({
                api_error_message: "invalid phone number code",
                phone_code: phoneNumber.substring(0, 2)
            })
            return next(new Error("please enter an egyptian number!", { cause: 400 }))
        }
        userData.phoneNumber = phoneNumber
        console.log({
            message: "phone number added!"
        })
    }

    if (country) {
        if (countries.includes(country)) {
            userData.country = country
            console.log({
                message: "country added!"
            })
        } else {
            console.log({
                api_error_message: "invalid country",
                country: country
            })
            return next(new Error('invalid country!', { cause: 400 }))
        }
    }

    if (countryFlag) {
        userData.countryFlag = countryFlag
        console.log({
            message: "country flag added!"
        })
    }

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
        expiresIn: '1d',
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
    res.status(200).json({
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
    console.log({ user_fetching_errors: getUser.errors })
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
    console.log({ user_fetching_errors: getUser.errors })
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
        expiresIn: '1d',
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
    console.log({ user_updating_errors: updateUser.errors })
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
    console.log({ user_fetching_errors: getUser.errors })
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
    console.log({ user_updating_errors: updateUser.errors })
    if (!updateUser) {
        console.log({
            api_error_message: "failed to forget password in data base!",
        })
        return next(new Error('failed to update password status in data base!', { cause: 400 }))
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
    console.log("\nTOURIST RESET PASSWORD API\n")
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
            message: "token decoding error",
            JWTerrorName: error.name,
            JWTerrorMessage: error.message
        })
        if (error.name == 'TokenExpiredError') {
            return next(new Error('reset code expired!', { cause: 408 }))
        }
    }
    if (!decodedToken) {
        console.log({
            message: "token decoding failure"
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
    console.log({ user_fetching_errors: getUser.errors })
    if (!getUser) {
        console.log({
            message: "failed to find user!"
        })
        return next(new Error('failed to find user', { cause: 400 }))
    }
    if (decodedToken.resetCode !== getUser.resetCode) {
        console.log({
            message: "invalid reset code token!"
        })
        return next(new Error('invalid reset code token!', { cause: 400 }))
    }
    console.log({
        message: "user found!",
        user: getUser
    })

    const isPassMatch = await bcrypt.compare(newPassword, getUser.password)
    if (isPassMatch) {
        console.log({
            message: "new password duplicate",
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
    getUser.password = hashedNewPassword
    getUser.resetCode = null
    getUser.forgetPassword = false
    getUser.__v++
    if (!await getUser.save()) {
        return next(new Error('failed to reset password in data base', { cause: 500 }))
    }
    res.status(200).json({
        message: "reset password done!",
    })
}

// tourist auth , tourGuide auth (ocr) .

// this api will be used for both first time profile setUp and profile update
export const profileSetUp = async (req, res, next) => {
    // if this api will occur after logging in -> we will need a token
    console.log({
        body: req.body,
        files: req.files
    })
    console.log({
        // request: req,
        requestFile: req.file
    })
    const _id = req?.authUser._id
    const { phoneNumber, gender, age, language, country, preferences, countryFlag } = req.body // front -> not in DB document

    const getUser = await touristModel.findById(_id)
    if (!getUser) {
        return next(new Error("couldn't find user , invalid userID", { cause: 400 }))
    }

    if (phoneNumber) {
        console.log({
            length: phoneNumber.length,
        })
        if (phoneNumber.length !== 10) {
            return next(new Error("enter a valid phone number!", { cause: 400 }))
        }
        if (!EGphoneCodes.includes(phoneNumber.slice(0, 2))) {
            return next(new Error("please enter an egyptian number!", { cause: 400 }))
        }
        getUser.phoneNumber = phoneNumber
    }

    if (gender) {
        if (gender !== 'male' && gender !== 'female' && gender !== 'not specified') {
            return next(new Error('invalid gender!', { cause: 400 }))
        }
        getUser.gender = gender
    }

    if (country) {
        if (countries.includes(country)) {
            getUser.country = country
        } else {
            return next(new Error('invalid country!', { cause: 400 }))
        }
    }

    if (age) {
        getUser.age = age
    }

    if (language) {
        if (!languages.includes(language)) {
            return next(new Error("please enter a valid language!", { cause: 400 }))
        }
        getUser.language = language
    }

    if (preferences) {
        getUser.preferences = preferences
    }

    if (countryFlag) {
        userData.countryFlag = countryFlag
    }

    let profilePic, coverPic
    let profileUploadPath // for profile Picture
    let coverUploadPath // for cover picture
    if (req.file) {
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
    }
    else {
        return next(new Error('file must exist!', { cause: 400 }))
    }
    // if (req.files) {
    //     console.log({ files: req.files })
    //     console.log({
    //         profileArray: req.files['profilePicture'],
    //         coverArray: req.files['coverPicture']
    //     })
    //     // we can either make a new customId for the usesd document or not , it may be better for security
    //     let customId
    //     let flag = false
    //     if (getUser.customId) { // if you have a custom id then you surely have uploaded images before
    //         customId = getUser.customId
    //     }
    //     else { // else meanse that you don't have
    //         customId = nanoid()
    //         getUser.customId = customId
    //         flag = true
    //     }
    //     profileUploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/profilePicture`
    //     coverUploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/coverPicture`
    //     for (const array in req.files) { // this gets the names of the arrays not the arrays them selves
    //         console.log({
    //             iterationArrayName: array,
    //             typeOfIterationArray: typeof (array)
    //         })
    //         const arrayFields = req.files[array] // this should access the first array of req.files
    //         console.log({ iterationArray: arrayFields })
    //         for (const file of arrayFields) { // each object of the array inside the object
    //             if (file.fieldname === 'profilePicture') {
    //                 console.log({ accessed: true })
    //                 if (flag == false) {
    //                     await cloudinary.api.delete_resources_by_prefix(profileUploadPath)
    //                     await cloudinary.api.delete_folder(profileUploadPath)
    //                 }
    //                 console.log({ profilePicDeleted: true })
    //                 const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
    //                     folder: profileUploadPath
    //                 })
    //                 if (!secure_url || !public_id) {
    //                     return next(new Error("couldn't save the profile picture!", { cause: 400 }))
    //                 }
    //                 profilePic = { secure_url, public_id }
    //                 getUser.profilePicture = profilePic
    //             }
    //             else if (file.fieldname === 'coverPicture') {
    //                 console.log({ accessed: true })
    //                 if (flag == false) {
    //                     await cloudinary.api.delete_resources_by_prefix(coverUploadPath)
    //                     await cloudinary.api.delete_folder(coverUploadPath)
    //                 }
    //                 console.log({ coverPicDeleted: true })
    //                 const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
    //                     folder: coverUploadPath
    //                 })
    //                 if (!secure_url || !public_id) {
    //                     return next(new Error("couldn't save the image!", { cause: 400 }))
    //                 }
    //                 coverPic = { secure_url, public_id }
    //                 getUser.coverPicture = coverPic
    //             }
    //             else {
    //                 return next(new Error('invalid file fieldName!', { cause: 400 }))
    //             }
    //         }
    //     }
    // } else {
    //     profilePic = null
    //     coverPic = null
    //     profileUploadPath = null
    //     coverUploadPath = null
    // }

    req.profileImgPath = profileUploadPath
    // req.coverImgPath = coverUploadPath


    if (!await getUser.save()) {
        return next(new Error("couldn't update the user in database!", { cause: 500 }))
    }
    getUser.__v++
    res.status(200).json({
        message: "your profile updating is completed!",
        user: getUser
    })
}

export const logOut = async (req, res, next) => {
    const { _id } = req.authUser
    const getUser = await touristModel.findById(_id)
    if (!getUser) {
        return next(new Error('user not found!', { cause: 400 }))
    }
    getUser.token = null
    getUser.status = statuses.offline
    if (!await getUser.save()) {
        return next(new Error('failed to logout the user!', { cause: 400 }))
    }
    res.status(200).json({
        message: "logout is successfull!"
    })
}

export const deleteUser = async (req, res, next) => {
    const { _id } = req.authUser
    const getUser = await touristModel.findById(_id)
    if (!getUser) {
        return next(new Error('user not found!', { cause: 400 }))
    }
    const deleteUser = await touristModel.findByIdAndDelete(_id)
    if (!deleteUser) {
        return next(new Error("couldn't delete the user!", { cause: 500 }))
    }
    // the front end might want the token back to delete it from his local storage
    res.status(200).json({
        message: "User deleted successfully!",
        token: deleteUser.token
    })
}

export const getUserInfo = async (req, res, next) => {
    const { _id } = req.authUser
    const getUser = await touristModel.findById(_id)
        .select('userName email gender age phoneNumber language profilePicture.secure_url coverPicture.secure_url status confirmed country countryFlag preferences')
    if (!getUser) {
        return next(new Error('user not found!', { cause: 400 }))
    }
    res.status(200).json({
        message: "user fetching is successfull!",
        user: getUser
    })
}

export const changePassword = async (req, res, next) => {
    // TODO : make it on 2 APIs
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
    const { _id } = req.authUser
    const { oldPassword } = req.body
    if (!oldPassword) {
        return next(new Error('old password must be entered!', { cause: 400 }))
    }
    const getUser = await touristModel.findById(_id)
    if (!getUser) {
        return next(new Error('user not found , invalid userID', { cause: 400 }))
    }
    // this line will fail if the stored password in the data base is not hashed because bcrypt will hash it anyways then compare it
    const isPassMatch = bcrypt.compareSync(oldPassword, getUser.password)
    if (!isPassMatch) {
        return next(new Error("incorrect password!", { cause: 400 }))
    }

    // no email message , no extra token

    const passToken = generateToken({ payload: { email: getUser.email }, signature: process.env.change_password_secret_key, expiresIn: '1h' })

    const changePassLink = `${req.protocol}://${req.headers.host}/tourist/changeoldPass${passToken}`
    const message = `<a href = ${changePassLink} >PLEASE USE THIS LINK TO CHANGE YOUR PASSWORD !</a>`
    const subject = 'password changing'
    const sendEMail = emailService({ message, to: getUser.email, subject })
    if (!sendEMail) {
        return next(new Error('sending email failed!', { cause: 500 }))
    }

    res.status(200).json({
        message: "please check your email to continue changing you password!"
    })
}

export const changeOldPass = async (req, res, next) => {
    const { _id } = req.authUser
    const { passToken } = req.params
    const { newPassword, confirmNewPassword } = req.body
    if (!newPassword) {
        return next(new Error('you must enter the new Password!', { cause: 400 }))
    }
    if (!confirmNewPassword) {
        return next(new Error('you must confirm the new Password!', { cause: 400 }))
    }
    if (newPassword !== confirmNewPassword) {
        return next(new Error('passwords must match!', { cause: 400 }))
    }
    const decodedToken = verifyToken({ token: passToken, signature: process.env.change_password_secret_key })
    if (!decodedToken) {
        return next(new Error('invalid token!', { cause: 400 }))
    }
    const getUser = await touristModel.findOne({
        _id,
        email: decodedToken.email
    })
    if (!getUser) {
        return next(new Error("couldn't find the user , invalid userID!", { cause: 400 }))
    }
    const isPassMatch = bcrypt.compareSync(newPassword, getUser.password)
    if (isPassMatch) {
        return next(new Error('you must enter a new Password!', { cause: 400 }))
    }
    const newHashedPassword = bcrypt.hashSync(newPassword, +process.env.SIGN_UP_SALT_ROUNDS)
    getUser.password = newHashedPassword
    getUser.__v++
    if (!await getUser.save()) {
        return next(new Error('failed to save new password!', { cause: 500 }))
    }
    res.status(200).json({
        message: "changing password is successfull!"
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
    console.log(req.file)
    res.status(200).json({
        message: "file",
        file: req.file
    })
}