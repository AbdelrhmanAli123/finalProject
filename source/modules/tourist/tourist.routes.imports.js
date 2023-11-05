import { Router } from 'express'
import { isAuth } from '../../middlewares/auth.js'
import { validationCoreFunction } from '../../middlewares/joiValidation.js'
import { asyncHandler } from '../../utilities/asyncHandler.js'
import { multerHostFunction } from '../../services/multerHost.js'
import * as touristCont from './tourist.controller.js'
import * as touristVS from './tourist.validationSchemas.js'
import { allowedExtensions } from '../../utilities/allowedUploadExtensions.js'

export {
    Router, isAuth, validationCoreFunction, asyncHandler, multerHostFunction, touristCont, touristVS, allowedExtensions
}