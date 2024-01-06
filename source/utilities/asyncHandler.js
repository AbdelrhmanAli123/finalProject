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
                if (req?.ministryLiscenceImgPath) {
                    console.log({
                        async_handler_message: "ministry liscence image path is passed here!",
                        ministry_liscence_image_path: req?.ministryLiscenceImgPath
                    })
                    await cloudinary.api.delete_resources_by_prefix(req.ministryLiscenceImgPath)
                    await cloudinary.api.delete_folder(req.ministryLiscenceImgPath)
                    console.log({
                        async_handler_message: "ministry liscence image is deleted!"
                    })
                }
                if (req?.syndicateLiscenceImgPath) {
                    console.log({
                        async_handler_message: "syndicate liscence image path is passed here!",
                        ministry_liscence_image_path: req?.syndicateLiscenceImgPath
                    })
                    await cloudinary.api.delete_resources_by_prefix(req.syndicateLiscenceImgPath)
                    await cloudinary.api.delete_folder(req.syndicateLiscenceImgPath)
                    console.log({
                        async_handler_message: "syndicate liscence image is deleted!"
                    })
                }
                if (req?.CvfilePath) {
                    console.log({
                        async_handler_message: "CV file path is passed here!",
                        ministry_liscence_image_path: req?.CvfilePath
                    })
                    await cloudinary.api.delete_resources_by_prefix(req.CvfilePath)
                    await cloudinary.api.delete_folder(req.CvfilePath)
                    console.log({
                        async_handler_message: "CV file is deleted!"
                    })
                }
                if (req.profilePictureFileName || req.CVFileName || req.ministryFileName || req.syndicateFileName) {
                    try {
                        const temp_folder_files = await fsPromise.readdir(process.env.LOCAL_TEMP_UPLOADS_PATH)
                        await Promise.all(temp_folder_files.map(async (file) => {
                            const filePath = path.join(process.env.LOCAL_TEMP_UPLOADS_PATH, file)
                            await fsPromise.unlink(filePath)
                        }))
                        console.log({
                            message: `folder ${process.env.LOCAL_TEMP_UPLOADS_PATH} is emptied successfully!`
                        })
                    } catch (error) {
                        console.log({
                            message: `failed to empty the folder ${process.env.LOCAL_TEMP_UPLOADS_PATH}`
                        })
                    }
                }
                if (err.message === 'TourGuide validation failed: email: Path `email` is required.') {
                    console.log({
                        async_handler_message: 'Handling email validation error...',
                    });
                    return res.status(400).json({ error: 'Email is required.' });
                }
                console.log("\nASYNC HANDLER FINISHED!\n")
                return next(new Error(`API failed to run !\nerror: ${err} \ncause: ${err.message}`, { cause: 500 }))
            })
    }
}