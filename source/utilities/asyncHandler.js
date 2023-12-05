import cloudinary from "../services/cloudinary.js"

export const asyncHandler = (API) => { // API -> api controller 
    return (req, res, next) => {
        // API is already async and it is a function
        API(req, res, next)
            .catch(async (err) => {
                console.log("\nASYNC HANDLER!\n")
                console.log({
                    async_handler_err: err,
                    async_handler_message: err?.message
                })
                if (req?.coverImgPath) {
                    console.log({
                        async_handler_message: "cover image path is passed here!",
                        cover_image_path: req?.coverImgPath
                    })
                    await cloudinary.api.delete_resources_by_prefix(req.coverImgPath)
                    await cloudinary.api.delete_folder(req.coverImgPath)
                    console.log({
                        async_handler_message: "cover image is deleted!"
                    })
                }
                if (req?.profileImgPath) {
                    console.log({
                        async_handler_message: "profile image path is passed here!",
                        profile_image_path: req?.profileImgPath
                    })
                    await cloudinary.api.delete_resources_by_prefix(req.profileImgPath)
                    await cloudinary.api.delete_folder(req.profileImgPath)
                    console.log({
                        async_handler_message: "profile image is deleted!"
                    })
                }
                console.log("\nASYNC HANDLER FINISHED!\n")
                return next(new Error(`API failed to run !\nerror: ${err} \ncause: ${err.message}`, { cause: 500 }))
            })
    }
}