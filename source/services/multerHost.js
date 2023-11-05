import multer from 'multer'
import { allowedExtensions } from '../utilities/allowedUploadExtensions.js'

export const multerHostFunction = (extensions = []) => {
    if (!extensions) {
        extensions = allowedExtensions.image
    }
    const multerStorage = multer.diskStorage({})
    // const fileFilter = (req, file, cb) => {
    //     const fileExtension = file.originalname.split('.').pop().toLowerCase();
    //     if (!extensions.includes(fileExtension)) {
    //         cb(null, false)
    //     }
    //     cb(null, true)
    // }
    const fileUplaod = multer({
        storage: multerStorage,
        fileFilter: (req, file, cb) => {
            if (!extensions.includes(file?.mimetype)) {
                cb(null, false)
            }
            cb(null, true)
        }
    })
    return fileUplaod
}