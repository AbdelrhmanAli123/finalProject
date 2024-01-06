import { tourGuideModel } from "../../dataBase/models/tourGuide.model.js"
import bcrypt from 'bcrypt' // encryption
import cloudinary from "../../services/cloudinary.js" // cloudinary
import slugify from "slugify" // slug
import axios from 'axios' // for hitting requests internally (AI model requests)
import FormData from 'form-data'
import { generateToken, verifyToken } from "../../utilities/tokenFunctions.js" // token
import { customAlphabet } from 'nanoid' // custom id
import { emailService } from "../../services/mailService.js"
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { systemRoles } from '../../utilities/systemRoles.js'
import { EGphoneCodes } from "../../utilities/phoneCodes.js"
import { statuses } from '../../utilities/activityStatuses.js'
import fs from 'fs'
import path from 'path'
import fsPromise from 'fs/promises'
import queryString from "query-string"

export {
    EGphoneCodes, FormData, ReasonPhrases, StatusCodes, axios, bcrypt, cloudinary,
    customAlphabet, emailService, generateToken, verifyToken, slugify, statuses, systemRoles,
    tourGuideModel, fs, path, fsPromise, queryString
}