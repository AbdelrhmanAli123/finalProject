import { Router } from "express";
import { isAuth } from '../../middlewares/auth.js'
import { validationCoreFunction } from '../../middlewares/joiValidation.js'
import { asyncHandler } from '../../utilities/asyncHandler.js'
import { multerHostFunction, multertempFunction } from '../../services/multerHost.js'
import { allowedExtensions } from '../../utilities/allowedUploadExtensions.js'
import * as TG_cont from './tourGuide.controller.js'
import * as TG_vs from './tourGuide.validationSchemas.js'

export {
    Router, allowedExtensions, asyncHandler, isAuth, multerHostFunction,
    validationCoreFunction, TG_cont, TG_vs, multertempFunction
}
