import { touristModel } from "../../dataBase/models/tourist.model.js" // DB model
import bcrypt from 'bcrypt' // encryption
import cloudinary from "../../services/cloudinary.js" // cloudinary
import slugify from "slugify" // slug
import { generateToken, verifyToken } from "../../utilities/tokenFunctions.js" // token
import { customAlphabet } from 'nanoid' // custom id
import { emailService } from "../../services/mailService.js"
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { systemRoles } from '../../utilities/systemRoles.js'
import { EGphoneCodes } from "../../utilities/phoneCodes.js"
import { statuses } from '../../utilities/activityStatuses.js'
import { languages, languagesCodes } from '../../utilities/languages.js'
import { countries, countriesCodes } from "../../utilities/nationalities.js"

export {
    bcrypt, cloudinary, touristModel, slugify, generateToken, verifyToken, customAlphabet, emailService,
    ReasonPhrases, StatusCodes, systemRoles, EGphoneCodes, languages, statuses, languagesCodes,
    countries, countriesCodes
}