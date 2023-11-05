import {
    bcrypt, cloudinary, touristModel, slugify, generateToken, verifyToken, customAlphabet, emailService,
    ReasonPhrases, StatusCodes, systemRoles
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
        userName, email, password, confirmPassword, phoneNumber, gender, age, language
    } = req.body
    console.log(req.file)
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
    let image
    if (req.file) {
        const customId = nanoid()
        const uploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/profilePicture`
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: uploadPath
        })
        if (!secure_url || !public_id) {
            return next(new Error("couldn't save the image!", { cause: 400 }))
        }
        image = { secure_url, public_id }
        userData.profilePicture = image
        userData.customeId = customId
    }

    req.imagePath = uploadPath
    const hashedPassword = bcrypt.hashSync(password, +process.env.SIGN_UP_SALT_ROUNDS)
    userData.password = hashedPassword

    if (age) { userData.age = age }
    if (gender) { userData.gender = gender }
    if (language) { userData.language = language }
    if (phoneNumber) { userData.phoneNumber = phoneNumber }

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
        }
    })

    saveUser.token = token
    saveUser.status = 'Online'
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
        }
    })
    if (!token) {
        return next(new Error('failed to generate user token', { cause: 500 }))
    }

    const updateUser = await touristModel.findOneAndUpdate({ email }, { status: 'Online', token }, { new: true })
    if (!updateUser) {
        return next(new Error('failed to login the user!', { cause: 500 }))
    }

    res.status(200).json({
        message: "login is successfull!",
        user: updateUser
    })
}

// first make this api for tourists only , then make it for tourGuides and other roles 
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
        expiresIn: '1h'
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
    const decodedToken = verifyToken({
        token,
        signature: process.env.reset_password_secret_key
    })
    if (!decodedToken) {
        return next(new Error('failed to decode the token', { cause: 400 }))
    }
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
    if (!await getUser.save()) {
        return next(new Error('failed to reset password in data base', { cause: 500 }))
    }
    res.status(200).json({
        message: "reset password done!",
        user: getUser
    })
}

// tourist auth , tourGuide auth (ocr) .
// export const profileSetting = async (req, res, next) => {
//     // if this api will occur after logging in -> we will need a token
//     const { authorization } = req.headers // front
//     const { phoneNumber } = req.body // front -> not in DB document

//     const token = authorization.split(' ')[1]

//     const decodedToken = verifyToken({
//         signature: process.env.LOGIN_SECRET_KEY,
//         token
//     })
// }