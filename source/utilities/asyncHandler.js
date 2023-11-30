import cloudinary from "../services/cloudinary.js"

export const asyncHandler = (API) => { // API -> api controller 
    return (req, res, next) => {
        // API is already async and it is a function
        API(req, res, next)
            .catch(async (err) => {
                console.log({
                    err: err,
                    message: err?.message
                })
                if (req?.coverImgPath) {
                    await cloudinary.api.delete_resources_by_prefix(req.coverImgPath)
                    await cloudinary.api.delete_folder(req.coverImgPath)
                }
                if (req?.profileImgPath) {
                    await cloudinary.api.delete_resources_by_prefix(req.profileImgPath)
                    await cloudinary.api.delete_folder(req.profileImgPath)
                }
                return next(new Error(`API failed to run !, cause: ${err.message}`, { cause: 500 }))
            })
    }
}