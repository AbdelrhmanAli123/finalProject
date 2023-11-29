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
    const {
        userName, email, password, confirmPassword, phoneNumber, gender, age, language, country
    } = req.body
    const findUser = await touristModel.findOne({ $or: [{ email: email }, { userName: userName }] })
    if (findUser?.email === email) {
        return next(new Error('email already exists!', { cause: 400 }))
    } else if (findUser?.userName === userName) {
        return next(new Error('userName already exists!', { cause: 400 }))
    }
    if (password !== confirmPassword) {
        return next(new Error("passwords don't match!", { cause: 400 }))
    }
    const slug = slugify(userName, '_')
    // TODO : add the address to the object when you deal with addresses
    const userData = {
        userName,
        email,
        slug,
        // address
    }
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
                }
                else {
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

    if (age) { userData.age = age }
    if (gender) {
        if (gender !== 'male' && gender !== 'female' && gender !== 'not specified') {
            return next(new Error('invalid gender!', { cause: 400 }))
        }
        userData.gender = gender
    }
    if (language) {
        if (!languages.includes(language)) {
            return next(new Error("please enter a valid language!", { cause: 400 }))
        }
        userData.language = language
    }
    if (phoneNumber) {
        console.log({
            length1: phoneNumber.length
        })
        if (phoneNumber.length !== 11) {
            return next(new Error("enter a valid phone number!", { cause: 400 }))
        }
        if (!EGphoneCodes.includes(phoneNumber.substring(0, 3))) {
            return next(new Error("please enter an egyptian number!", { cause: 400 }))
        }
        userData.phoneNumber = phoneNumber
    }

    if (country) {
        if (countries.includes(country)) {
            userData.country = country
        } else {
            return next(new Error('invalid country!', { cause: 400 }))
        }
    }

    const saveUser = await touristModel.create(userData)
    if (!saveUser) {
        await cloudinary.uploader.destroy(image.public_id)
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

    saveUser.token = token
    saveUser.status = statuses.online
    await saveUser.save()

    const confirmToken = generateToken({ payload: { email }, signature: process.env.CONFIRM_LINK_SECRETE_KEY, expiresIn: '1h' })
    // `${req.protocol}://${req.headers.host}:${process.env.PORT}/user/confirmEmail/${EmailConfirmToken}`

    // TODO : you might add a '/' before 'confirmToken'
    console.log(`req destination host:${req.headers.host}`)
    const confirmLink = `${req.protocol}://${req.headers.host}/tourist/confirmAccount${confirmToken}`
    const message = `<a href = ${confirmLink} >PLEASE USE THIS LINK TO CONFIRM YOUR EMAIL !</a>`
    const subject = 'Email confirmation'
    const sendEMail = emailService({ message, to: email, subject })
    if (!sendEMail) {
        return next(new Error('sending email failed!', { cause: 500 }))
    }

    res.status(200).json({
        message: "user added!",
        user: saveUser
    })
}

export const confirmAccount = async (req, res, next) => {
    const { confirmToken } = req.params
    const decodeToken = verifyToken({ token: confirmToken, signature: process.env.CONFIRM_LINK_SECRETE_KEY })
    if (!decodeToken) {
        return next(new Error('failed to decode the token!', { cause: 400 }))
    }
    const getUser = await touristModel.findOne({ email: decodeToken?.email })
    console.log({ confirmAccountDbErrors: getUser.errors })
    if (!getUser) {
        return next(new Error('failed to find user!', { cause: 500 }))
    }
    // the reason that this API on cloud gets this response always is that it sends the request twice by itslef
    // but it still works and not always has the request for hit twice , sometimes it hit once and it does work
    if (getUser.confirmed === true) {
        return next(new Error('user is already confirmed!', { cause: 400 }))
    }
    getUser.confirmed = true
    getUser.save()
    res.status(200).json({
        message: "confirmation done!",
        user: getUser
    })
}

export const touristLogIn = async (req, res, next) => {
    const { email, password } = req.body
    const getUser = await touristModel.findOne({ email })
    if (!getUser) {
        console.log('email error')
        return next(new Error('invalid login credentials', { cause: 400 }))
    }
    console.log('User found:', getUser)
    const isPassMatch = bcrypt.compareSync(password, getUser.password)
    console.log({
        hashedPassword: isPassMatch
    })
    if (!isPassMatch) {
        console.log('pass error')
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
        return next(new Error('failed to generate user token', { cause: 500 }))
    }

    const updateUser = await touristModel.findOneAndUpdate({ email }, { status: statuses.online, token }, { new: true }).select('userName email token')
    if (!updateUser) {
        return next(new Error('failed to login the user!', { cause: 500 }))
    }

    res.status(200).json({
        message: "login is successfull!",
        user: updateUser
    })
}

// TODO : first make this api for tourists only , then make it for tourGuides and other roles 
export const forgetPassword = async (req, res, next) => {
    // this api occurs at the login page , doesn't need a token nor entering a password
    const { email } = req.body
    const getUser = await touristModel.findOne({ email })
    if (!getUser) {
        return next(new Error('invalid email', { cause: 400 }))
    }
    const code = nanoid2() // reset code generated
    const hashedCode = bcrypt.hashSync(code, +process.env.FORGET_PASSWORD_CODE_SALT) // reset code hashed
    // we need this token to get the user Data from database in the reset password api
    const token = generateToken({
        payload: {
            email,
            resetCode: hashedCode
        },
        signature: process.env.reset_password_secret_key,
        expiresIn: '300s'
    })
    // const resetPassLink = `${req.protocol}://${req.headers.host}/tourist/resetPassword${token}`
    const resetEmail = emailService({
        to: email,
        subject: 'Reset password',
        message: ` <h1>use this code below to reset your password in you app</h1>
                <p>${code}</p>`
    })
    console.log(resetEmail)
    if (!resetEmail) {
        return next(new Error('failed to reset the password', { cause: 400 }))
    }
    const updateUser = await touristModel.findOneAndUpdate({ email }, { resetCode: hashedCode, forgetPassword: true }, { new: true })
    if (!updateUser) {
        return next(new Error('failed to update password status in data base!', { cause: 400 }))
    }
    // TODO : in the response , the 'resetCode' must be hashed or encrypted for the front end also and the front end can take that and dehash it
    res.status(200).json({
        message: "forget password done!",
        token,
        resetCode: code
    })
}

export const resetPassword = async (req, res, next) => {
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
            JWTerrorName: error.name,
            JWTerrorMessage: error.message
        })
        if (error.name == 'TokenExpiredError') {
            return next(new Error('reset code expired!', { cause: 408 }))
        }
    }
    if (!decodedToken) {
        return next(new Error('failed to decode the token', { cause: 400 }))
    }
    // if (decodedToken.Error.message === 'TokenExpiredError') {
    //     return next(new Error('reset code expired!', { cause: 408 }))
    // }
    const getUser = await touristModel.findOne({
        email: decodedToken.email,
    })
    if (decodedToken.resetCode !== getUser.resetCode) {
        return next(new Error('invalid reset code token!', { cause: 400 }))
    }
    if (!getUser) {
        return next(new Error('failed to find user', { cause: 400 }))
    }
    const isPassMatch = await bcrypt.compare(newPassword, getUser.password)
    console.log({ resetPasswordMatch: isPassMatch })
    if (isPassMatch) {
        return next(new Error('enter a different password', { cause: 400 }))
    }
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
    const _id = req?.authUser._id
    const { phoneNumber, gender, age, language, country, preferences } = req.body // front -> not in DB document

    const getUser = await touristModel.findById(_id)
    if (!getUser) {
        return next(new Error("couldn't find user , invalid userID", { cause: 400 }))
    }

    if (phoneNumber) {
        console.log({
            length: phoneNumber.length,
        })
        if (phoneNumber.length !== 11) {
            return next(new Error("enter a valid phone number!", { cause: 400 }))
        }
        if (!EGphoneCodes.includes(phoneNumber.slice(0, 3))) {
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

    let profilePic, coverPic
    let profileUploadPath // for profile Picture
    let coverUploadPath // for cover picture
    if (req.files) {
        console.log({ files: req.files })
        // we can either make a new customId for the usesd document or not , it may be better for security
        let customId
        if (getUser.customId) { // if you have a custom id then you surely have uploaded images before
            customId = getUser.customId
        }
        else { // else meanse that you don't have
            customId = nanoid()
            getUser.customId = customId
        }
        profileUploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/profilePicture`
        coverUploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/coverPicture`
        for (const array in req.files) { // this gets the names of the arrays not the arrays them selves
            console.log({
                iterationArrayName: array,
                typeOfIterationArray: typeof (array)
            })
            const arrayFields = req.files[array] // this should access the first array of req.files
            console.log({ iterationArray: arrayFields })
            for (const file of arrayFields) { // each object of the array inside the object
                if (file.fieldname === 'profilePicture') {
                    console.log({ accessed: true })
                    await cloudinary.api.delete_resources_by_prefix(profileUploadPath)
                    await cloudinary.api.delete_folder(profileUploadPath)
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
                else if (file.fieldname === 'coverPicture') {
                    console.log({ accessed: true })
                    await cloudinary.api.delete_resources_by_prefix(coverUploadPath)
                    await cloudinary.api.delete_folder(coverUploadPath)
                    console.log({ coverPicDeleted: true })
                    const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                        folder: coverUploadPath
                    })
                    if (!secure_url || !public_id) {
                        return next(new Error("couldn't save the image!", { cause: 400 }))
                    }
                    coverPic = { secure_url, public_id }
                    getUser.coverPicture = coverPic
                }
                else {
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

    getUser.__v++

    if (!await getUser.save()) {
        return next(new Error("couldn't update the user in database!", { cause: 500 }))
    }
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
        .select('userName email gender age phoneNumber language profilePicture.secure_url coverPicture.secure_url status confirmed country preferences')
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