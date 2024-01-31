import {
    bcrypt, cloudinary, touristModel, slugify, generateToken, verifyToken, customAlphabet, emailService,
    ReasonPhrases, StatusCodes, systemRoles, EGphoneCodes, languages, statuses, languagesCodes,
    countries, countriesCodes, axios, FormData
} from '../tourist/tourist.controller.imports.js'
import { tourGuideModel } from '../tourGuide/tourGuide.controller.imports.js'
import { deleteAsset, restoreAsset, deleteFolder, restoreAssetPromise } from '../../utilities/cloudinary.deletion.js'

export const logOut = async (req, res, next) => {
    console.log("\nAUTH LOGOUT API\n")
    const { _id } = req.authUser

    let getUser
    if (req.userRole === systemRoles.tourist) {
        getUser = await touristModel.findById(_id)
        if (!getUser) {
            console.log({ api_error_message: "user id not found!" })
            return next(new Error('user not found!', { cause: 400 }))
        }
        console.log({
            message: "user is found!",
            user_found: getUser
        })
    } else if (req.userRole === systemRoles.tourGuide) {
        getUser = await tourGuideModel.findById(_id)
        if (!getUser) {
            console.log({ api_error_message: "user id not found!" })
            return next(new Error('user not found!', { cause: 400 }))
        }
        console.log({
            message: "user is found!",
            user_found: getUser
        })
    }

    getUser.token = null
    getUser.status = statuses.offline
    console.log({ message: "user is now offline!" })

    if (!await getUser.save()) {
        console.log({ api_error_message: "failed to logout the user" })
        return next(new Error('failed to logout the user!', { cause: 400 }))
    }
    console.log({ message: "user is logged out!" })

    console.log("\nAUTH LOGOUT IS DONE!\n")
    res.status(200).json({
        message: "logout is successfull!"
    })
}

// edit this to either differentiate between a 
// export const deleteUser = async (req, res, next) => {
//     console.log("\nAUTH DELETE API\n")
//     const { _id } = req.authUser

//     let getUser
//     if (req.userRole === systemRoles.tourist) {
//         getUser = await touristModel.findById(_id)
//         if (!getUser) {
//             console.log({ api_error_message: "user id not found!" })
//             return next(new Error('user not found!', { cause: 400 }))
//         }
//         console.log({
//             message: "user is found!",
//             user_found: getUser
//         })
//     } else if (req.userRole === systemRoles.tourGuide) {
//         getUser = await tourGuideModel.findById(_id)
//         if (!getUser) {
//             console.log({ api_error_message: "user id not found!" })
//             return next(new Error('user not found!', { cause: 400 }))
//         }
//         console.log({
//             message: "user is found!",
//             user_found: getUser
//         })
//     }

//     // tourist -> profile + cover
//     // tour guide -> profile + ministry + syndicate + cv

//     let customId = getUser.customId

//     let userProfilePath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/profilePicture` // PROBLEM : here is the problem , the path has tourists always and that's wrong
//     let userCoverPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/coverPicture`
//     let userMinistryPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/ministry_liscence`
//     let userSyndicatePath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/syndicate_liscence`
//     let userCVpath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourGuides/${customId}/CV`

//     let userFolderPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}`  // PROBLEM : here is the problem , the path has tourists always and that's wrong

//     let ministryPublicId = getUser.ministyliscence?.public_id // may get an error !
//     let syndicatePubliceId = getUser.syndicateLiscence?.public_id // may get an error !
//     let CVpublicId = getUser.CV?.public_id // may get an error !
//     let profilePublicId = getUser.profilePicture?.public_id
//     let coverPictureId = getUser.coverPicture?.public_id

//     // we need to delete the user's images and folders on cloudinary :
//     console.log({ message: "about to delete user assets!" })

//     console.log({ message: "about to delete user profile picture!" })
//     await cloudinary.api.resource(getUser.profilePicture?.public_id)
//         .then(async () => {
//             await cloudinary.api.delete_resources_by_prefix(userProfilePath)
//                 .then(() => console.log({ message: "profile picture is deleted!" }))
//                 .catch((err) => console.log({ api_error_message: "failed to delete profile picture!", error: err }))

//             await cloudinary.api.delete_folder(userProfilePath)
//                 .then(() => console.log({ message: "profile picture folder is deleted!" }))
//                 .catch((err) => console.log({ api_error_message: "failed to delete profile picture folder!", error: err }))
//         })
//         .catch((err) => {
//             console.log({
//                 api_error_message: "profile picture is not found!",
//                 err: err
//             })
//         })

//     if (getUser.role === systemRoles.tourist) {
//         console.log({ message: "about to delete user cover picture!" })
//         await cloudinary.api.resource(getUser.coverPicture?.public_id)
//             .then(async () => {
//                 await cloudinary.api.delete_resources_by_prefix(userCoverPath)
//                     .then(() => console.log({ message: "cover picture is deleted!" }))
//                     .catch((err) => console.log({ api_error_message: "failed to delete cover picture!", error: err }))

//                 await cloudinary.api.delete_folder(userCoverPath)
//                     .then(() => console.log({ message: "cover picture folder is deleted!" }))
//                     .catch((err) => console.log({ api_error_message: "failed to delete cover picture folder!", error: err }))
//             })
//             .catch((err) => {
//                 console.log({
//                     api_error_message: "cover picture is not found!",
//                     err: err
//                 })
//             })
//     } else if (getUser.role === systemRoles.tourGuide) {
//         // we need to delete the CV file , ministry image and syndicate image !

//         // ministry liscence image
//         console.log({ message: "about to delete user ministry liscence!" })
//         await cloudinary.api.resource(getUser.ministyliscence?.public_id)
//             .then(async () => {
//                 await cloudinary.api.delete_resources_by_prefix(userMinistryPath)
//                     .then(() => console.log({ message: "ministry liscence is deleted!" }))
//                     .catch((err) => console.log({ api_error_message: "failed to delete ministry liscence!", error: err }))

//                 await cloudinary.api.delete_folder(userMinistryPath)
//                     .then(() => console.log({ message: "ministry liscence folder is deleted!" }))
//                     .catch((err) => console.log({ api_error_message: "failed to delete ministry liscence folder!", error: err }))
//             })
//             .catch((err) => {
//                 console.log({
//                     api_error_message: "ministry liscence is not found!",
//                     err: err
//                 })
//             })

//         // syndicate liscence image
//         console.log({ message: "about to delete user syndicate liscence!" })
//         await cloudinary.api.resource(getUser.syndicateLiscence?.public_id)
//             .then(async () => {
//                 await cloudinary.api.delete_resources_by_prefix(userSyndicatePath)
//                     .then(() => console.log({ message: "syndicate liscence is deleted!" }))
//                     .catch((err) => console.log({ api_error_message: "failed to delete syndicate liscence!", error: err }))

//                 await cloudinary.api.delete_folder(userSyndicatePath)
//                     .then(() => console.log({ message: "syndicate liscence folder is deleted!" }))
//                     .catch((err) => console.log({ api_error_message: "failed to delete syndicate liscence folder!", error: err }))
//             })
//             .catch((err) => {
//                 console.log({
//                     api_error_message: "syndicate liscence is not found!",
//                     err: err
//                 })
//             })

//         // CV file
//         console.log({ message: "about to delete user CV file!" })
//         await cloudinary.api.resource(getUser.CV?.public_id)
//             .then(async () => {
//                 await cloudinary.api.delete_resources_by_prefix(userCVpath)
//                     .then(() => console.log({ message: "CV file is deleted!" }))
//                     .catch((err) => console.log({ api_error_message: "failed to delete CV file!", error: err }))

//                 await cloudinary.api.delete_folder(userCVpath)
//                     .then(() => console.log({ message: "CV file folder is deleted!" }))
//                     .catch((err) => console.log({ api_error_message: "failed to delete CV file folder!", error: err }))
//             })
//             .catch((err) => {
//                 console.log({
//                     api_error_message: "CV file is not found!",
//                     err: err
//                 })
//             })
//     }

//     console.log({ message: "about to delete user main folder!" })
//     await cloudinary.api.delete_folder(userFolderPath)
//         .then(() => console.log({ message: "user main folder is deleted!" }))
//         .catch((err) => console.log({ api_error_message: "failed to delete the user's main folder!", error: err }))


//     const deleteUser = await touristModel.findByIdAndDelete(_id)
//     if (!deleteUser) {
//         console.log({ api_error_message: "failed to delete the user , attempting to restore the images!" })

//         // restoring the profile picture
//         await cloudinary.api.create_folder(userProfilePath, { resource_type: 'raw' })
//             .then(async () => {
//                 console.log({ message: "user profile picture folder restored!" })
//                 await cloudinary.api.restore(profilePublicId)
//                     .then(() => console.log({ message: "profile picture is restored!" }))
//                     .catch(async (err) => {
//                         console.log({
//                             message: "failed to restore the profile picture!",
//                             error: err
//                         })
//                         await cloudinary.api.delete_folder(userFolderPath)
//                             .then(() => console.log({ message: "user folder is deleted!" }))
//                             .catch((err) => console.log({ api_error_message: "failed to delete user folder!", error: err }))
//                     })
//             })
//             .catch((err) => console.log({
//                 api_error_message: "failed to restore the profile picture",
//                 error: err
//             }))

//         if (getUser.role === systemRoles.tourist) {
//             // restoring cover picture
//             await cloudinary.api.create_folder(userCoverPath, { resource_type: 'raw' })
//                 .then(async () => {
//                     console.log({ message: "user cover picture folder restored!" })
//                     await cloudinary.api.restore(coverPictureId)
//                         .then(() => console.log({ message: "cover picture is restored!" }))
//                         .catch(async (err) => {
//                             console.log({
//                                 message: "failed to restore the cover picture!",
//                                 error: err
//                             })
//                             await cloudinary.api.delete_folder(userFolderPath)
//                                 .then(() => console.log({ message: "user folder is deleted!" }))
//                                 .catch((err) => console.log({ api_error_message: "failed to delete user folder!", error: err }))
//                         })
//                 })
//                 .catch((err) => console.log({
//                     api_error_message: "failed to restore the profile picture",
//                     error: err
//                 }))
//         } else if (getUser.role === systemRoles.tourGuide) {
//             // restoring ministry liscence image
//             await cloudinary.api.create_folder(userMinistryPath, { resource_type: 'raw' })
//                 .then(async () => {
//                     console.log({ message: "user ministry liscence folder restored!" })
//                     await cloudinary.api.restore(ministryPublicId)
//                         .then(() => console.log({ message: "ministry liscence is restored!" }))
//                         .catch(async (err) => {
//                             console.log({
//                                 message: "failed to restore the ministry liscence!",
//                                 error: err
//                             })
//                             await cloudinary.api.delete_folder(userFolderPath)
//                                 .then(() => console.log({ message: "user folder is deleted!" }))
//                                 .catch((err) => console.log({ api_error_message: "failed to delete user folder!", error: err }))
//                         })
//                 })
//                 .catch((err) => console.log({
//                     api_error_message: "failed to restore the ministry liscence",
//                     error: err
//                 }))

//             // restoring syndicate liscence image
//             await cloudinary.api.create_folder(userSyndicatePath, { resource_type: 'raw' })
//                 .then(async () => {
//                     console.log({ message: "user syndicate liscence folder restored!" })
//                     await cloudinary.api.restore(syndicatePubliceId)
//                         .then(() => console.log({ message: "syndicate liscence is restored!" }))
//                         .catch(async (err) => {
//                             console.log({
//                                 message: "failed to restore the syndicate liscence!",
//                                 error: err
//                             })
//                             await cloudinary.api.delete_folder(userFolderPath)
//                                 .then(() => console.log({ message: "user folder is deleted!" }))
//                                 .catch((err) => console.log({ api_error_message: "failed to delete user folder!", error: err }))
//                         })
//                 })
//                 .catch((err) => console.log({
//                     api_error_message: "failed to restore the syndicate liscence",
//                     error: err
//                 }))

//             // restoring CV file
//             await cloudinary.api.create_folder(userCVpath, { resource_type: 'raw' })
//                 .then(async () => {
//                     console.log({ message: "user CV file folder restored!" })
//                     await cloudinary.api.restore(CVpublicId)
//                         .then(() => console.log({ message: "CV file is restored!" }))
//                         .catch(async (err) => {
//                             console.log({
//                                 message: "failed to restore the CV file!",
//                                 error: err
//                             })
//                             await cloudinary.api.delete_folder(userFolderPath)
//                                 .then(() => console.log({ message: "user folder is deleted!" }))
//                                 .catch((err) => console.log({ api_error_message: "failed to delete user folder!", error: err }))
//                         })
//                 })
//                 .catch((err) => console.log({
//                     api_error_message: "failed to restore the CV file",
//                     error: err
//                 }))
//         }

//         customId = null
//         userProfilePath = null
//         userCoverPath = null
//         userFolderPath = null
//         return next(new Error("couldn't delete the user!", { cause: 500 }))
//     }
//     console.log({ message: "user is deleted!" })
//     customId = null
//     userProfilePath = null
//     userCoverPath = null
//     userFolderPath = null

//     console.log("\nAUTH DELETE IS DONE!\n")
//     res.status(200).json({
//         message: "User deleted successfully!",
//         token: deleteUser.token
//     })
// }

export const getUserInfo = async (req, res, next) => {
    console.log("\nAUTH GET USER INFO API\n")
    const { _id } = req.authUser

    let getUser
    if (req.userRole === systemRoles.tourist) {
        getUser = await touristModel.findById(_id)
            .select('userName email gender age phoneNumber language profilePicture.secure_url coverPicture.secure_url status confirmed country countryFlag preferences')
        if (!getUser) {
            console.log({ api_error_message: "user id not found!" })
            return next(new Error('user not found!', { cause: 400 }))
        }
        console.log({
            message: "user is found!",
            user_found: getUser
        })
    } else if (req.userRole === systemRoles.tourGuide) {
        getUser = getUser = await tourGuideModel.findById(_id)
            .select('firstName lastName email birthDate description phoneNumber languages profilePicture.secure_url status confirmed CV.secure_url')
        if (!getUser) {
            console.log({ api_error_message: "user id not found!" })
            return next(new Error('user not found!', { cause: 400 }))
        }
        console.log({
            message: "user is found!",
            user_found: getUser
        })
    }

    console.log("\nAUTH GET USER INFO IS DONE!\n")
    res.status(200).json({
        message: "user fetching is successfull!",
        user: getUser
    })
}

export const confrirmOldPass = async (req, res, next) => {
    console.log("\nAUTH CONFIRM OLD PASS API\n")
    const { _id } = req.authUser
    const { oldPassword } = req.body

    if (!oldPassword) {
        console.log({
            user_error_message: "password is missing",
            entered_password: oldPassword,
            purpose: "confirm current password!"
        })
        return next(new Error('old password must be entered!', { cause: 400 }))
    }
    console.log({ message: "password is found!" })

    let getUser
    if (req.userRole === systemRoles.tourist) {
        getUser = await touristModel.findById(_id)
        if (!getUser) {
            console.log({ api_error_message: "user id not found!" })
            return next(new Error('user not found!', { cause: 400 }))
        }
        console.log({
            message: "user is found!",
            user_found: getUser
        })
    } else if (req.userRole === systemRoles.tourGuide) {
        getUser = getUser = await tourGuideModel.findById(_id)
        if (!getUser) {
            console.log({ api_error_message: "user id not found!" })
            return next(new Error('user not found!', { cause: 400 }))
        }
        console.log({
            message: "user is found!",
            user_found: getUser
        })
    }

    // this line will fail if the stored password in the data base is not hashed because bcrypt will hash it anyways then compare it
    const isPassMatch = bcrypt.compareSync(oldPassword, getUser.password)
    console.log({ is_password_valid: isPassMatch })
    if (!isPassMatch) {
        console.log({ user_error_message: "user entered incorrect password!" })
        return next(new Error("incorrect password!", { cause: 400 }))
    }
    console.log({ message: "the entered password is correct!" })

    console.log("\nAUTH CONFIRM OLD PASS IS DONE!\n")
    res.status(200).json({
        message: "you can continue to change your password!"
    })
}

export const changeOldPass = async (req, res, next) => {
    console.log("\nAUTH CHANGE PASSWORD API\n")
    const { _id } = req.authUser
    const { newPassword, confirmNewPassword } = req.body

    if (!newPassword) {
        console.log({ user_error_message: "new password is missing!" })
        return next(new Error('you must enter the new Password!', { cause: 400 }))
    }
    console.log({ message: "new password is found!" })
    if (!confirmNewPassword) {
        console.log({ user_error_message: "confirm new password is missing!" })
        return next(new Error('you must confirm the new Password!', { cause: 400 }))
    }
    console.log({ message: "confirm new password is found!" })

    if (newPassword !== confirmNewPassword) {
        console.log({
            user_error_message: "the user entered 2 non-matching passwords",
            entered_new_password: newPassword,
            entered_confirm_new_password: confirmNewPassword
        })
        return next(new Error('passwords must match!', { cause: 400 }))
    }
    console.log({ message: "the 2 entered passwords matched!" })

    let getUser
    if (req.userRole === systemRoles.tourist) {
        getUser = await touristModel.findById(_id)
        if (!getUser) {
            console.log({ api_error_message: "user id not found!" })
            return next(new Error('user not found!', { cause: 400 }))
        }
        console.log({
            message: "user is found!",
            user_found: getUser
        })
    } else if (req.userRole === systemRoles.tourGuide) {
        getUser = getUser = await tourGuideModel.findById(_id)
        if (!getUser) {
            console.log({ api_error_message: "user id not found!" })
            return next(new Error('user not found!', { cause: 400 }))
        }
        console.log({
            message: "user is found!",
            user_found: getUser
        })
    }

    const isPassMatch = bcrypt.compareSync(newPassword, getUser.password)
    console.log({ is_new_pass_matches_old: isPassMatch })
    if (isPassMatch) {
        console.log({ user_error_message: "user entered the same password as the old one!" })
        return next(new Error('you must enter a new Password!', { cause: 400 }))
    }
    console.log({ message: "the new password doesn't match the old one!" })

    const newHashedPassword = bcrypt.hashSync(newPassword, +process.env.SIGN_UP_SALT_ROUNDS)
    getUser.password = newHashedPassword
    console.log({ message: "new password is updated!" })

    if (!await getUser.save()) {
        console.log({ api_error_message: "failed to update the new password!" })
        return next(new Error('failed to save new password!', { cause: 500 }))
    }
    getUser.__v++
    console.log({ message: "user password is changed!" })

    console.log("\nAUTH CHANGE PASSWORD IS DONE!\n")
    res.status(200).json({
        message: "changing password is successfull!"
    })
}

export const new_deleteUser = async (req, res, next) => {
    console.log("\nAUTH DELETE USER API\n")

    const getUser = req.authUser

    console.log({
        passed_auth_user: getUser
    })
    // perparing variables :
    // user custom id :
    const customId = getUser.customId

    // assets paths : 
    // for both tourists and tour guides
    let profilePath = `${process.env.PROJECT_UPLOADS_FOLDER}/${getUser.role}s/${customId}/profilePicture`

    // tourists only
    let coverPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/coverPicture`

    // tour guides only
    let ministryPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourGuides/${customId}/ministry_liscence`
    let syndicatepath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourGuides/${customId}/syndicate_liscence`
    let CVpath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourGuides/${customId}/CV`

    // user folder path : 
    let userFolderPath = `${process.env.PROJECT_UPLOADS_FOLDER}/${getUser.role}s/${customId}`

    // public ids :
    let ministryPublicId = getUser.ministyliscence?.public_id // may get an error !
    let syndicatePubliceId = getUser.syndicateLiscence?.public_id // may get an error !
    let CVpublicId = getUser.CV?.public_id // may get an error !
    let profilePublicId = getUser.profilePicture?.public_id
    let coverPictureId = getUser.coverPicture?.public_id

    // profile picture deleting
    const profileDeleting = await deleteAsset(profilePublicId, profilePath)
    if (profileDeleting.deleted == false) {
        let message
        console.log({
            api_error_message: "couldn't delete the profile picture"
        })
        const profileRestoring = await restoreAsset(profilePublicId, profilePath)
        if (profileRestoring == false) {
            console.log({
                api_error_message: "failed to restore the profile picture from the cloudinary server"
            })
            message = "API failed , profile picture is lost!" // means both deletion and the attempt to restoration failed!
            return next(new Error(message, { cause: 500 }))
        }
        console.log({ message: "profile picture is restored!" })
        message = "deletion failed and the profile picture is restored!"
        return next(new Error(message, { cause: 500 }))
    } else if (profileDeleting.notFound == true) {
        console.log({
            message: "resource doesn't exist"
        })
    }
    console.log({ message: "profile picture is deleted successfully!" })

    // tourist only deleting 
    if (getUser.role === systemRoles.tourist) {
        // cover picture deleting
        const coverDeleting = await deleteAsset(coverPictureId, coverPath)
        if (coverDeleting.deleted == false) {
            let message
            console.log({
                api_error_message: "couldn't delete the cover picture"
            })
            const coverRestoring = await restoreAsset(coverPictureId, coverPath)
            if (coverRestoring == false) {
                console.log({
                    api_error_message: "Failed to restore the cover picture from the cloudinary server"
                })
                message = "API failed , cover picture is lost!"
                return next(new Error(message, { cause: 500 }))
            }
            console.log({ message: "cover picture is restored successfully!" })
            message = "deletion failed and the cover picture is restored!"
            return next(new Error(message, { cause: 500 }))
        } else if (coverDeleting.notFound == true) {
            console.log({
                message: "resource doesn't exist"
            })
        }
        console.log({ message: "cover picture is deleted successfully!" })
    }
    // tour guide only deleting
    else {
        // syndicate picture deleting
        const syndicateDeleting = await deleteAsset(syndicatePubliceId, syndicatepath)
        if (syndicateDeleting.deleted == false) {
            let message
            console.log({
                api_error_message: "Couldn't delete the syndicate picture"
            })
            const syndicateRestoring = await restoreAsset(syndicatePubliceId, syndicatepath)
            if (syndicateRestoring == false) {
                console.log({
                    api_error_message: "Failed to restore the syndicate picture from the cloudinary server"
                })
                message = "API failed , syndicate picture is lost!"
                return next(new Error(message, { cause: 500 }))
            }
            console.log({ message: "syndicate picture is restored successfully!" })
            message = "deletion failed and the syndicate picture is restored!"
            return next(new Error(message, { cause: 500 }))
        } else if (syndicateDeleting.notFound == true) {
            console.log({
                message: "resource doesn't exist"
            })
        }
        console.log({ message: "syndicate picture is deleted successfully!" })

        // ministry picture deleting
        const ministryDeleting = await deleteAsset(ministryPublicId, ministryPath)
        if (ministryDeleting.deleted == false) {
            let message
            console.log({
                api_error_message: "Couldn't delete the ministry picture"
            })
            const ministryRestoring = await restoreAsset(ministryPublicId, ministryPath)
            if (ministryRestoring == false) {
                console.log({
                    api_error_message: "Failed to restore the ministry picture from the cloudinary server"
                })
                message = "API failed , ministry picture is lost!"
                return next(new Error(message, { cause: 500 }))
            }
            console.log({ message: "ministry picture is restored successfully!" })
            message = "deletion failed and the ministry picture is restored!"
            return next(new Error(message, { cause: 500 }))
        } else if (ministryDeleting.notFound == true) {
            console.log({
                message: "resource doesn't exist"
            })
        }
        console.log({ message: "ministry image is deleted successfully!" })

        // CV picture deleting
        const CVdeleting = await deleteAsset(CVpublicId, CVpath)
        if (CVdeleting.deleted == false) {
            let message
            console.log({
                api_error_message: 'failed to delete the CV picture'
            })
            const CVrestoring = await restoreAsset(CVpublicId, CVpath)
            if (CVrestoring == false) {
                console.log({
                    api_error_message: 'Failed to restore the CV picture from the cloudinary server!'
                })
                message = "API failed , CV picture is lost!"
                return next(new Error(message, { cause: 500 }))
            }
            console.log({ message: "CV picture is restored successfully!" })
            message = "deletion failed and the CV picture is restored!"
            return next(new Error(message, { cause: 500 }))
        } else if (CVdeleting.notFound == true) {
            console.log({
                message: "resource doesn't exist"
            })
        }
        console.log({ message: "CV image is deleted successfully!" })
    }
    console.log({ message: "user assets are deleted successfully" })

    // user folder deleting
    await deleteFolder(userFolderPath)

    let deletedUser
    if (getUser.role === systemRoles.tourist) {
        deletedUser = await touristModel.findByIdAndDelete(getUser.id, { new: true })
        if (!deletedUser) {
            console.log({
                api_error_message: "failed to delete the user from the data base!"
            })
            // restoring all assets again
            const restoringPublicIDs = [profilePublicId, coverPictureId]
            const restoringPaths = [profilePath, coverPath]
            let i = 0
            try {
                const assetsRestoring = await Promise.all(restoringPublicIDs.map(async (public_id) => {
                    await restoreAssetPromise(public_id, restoringPaths[i])
                    i++
                }))
                console.log({
                    message: "user assets are restored successfully!"
                })
            } catch (error) {
                console.log({
                    api_error_message: "An error occurred while trying to restore the user's assets",
                    error: error
                })
            }
            return next(new Error("failed to delete the user !", { cause: 500 }))
        }
    } else if (getUser.role === systemRoles.tourGuide) {
        deletedUser = await tourGuideModel.findByIdAndDelete(getUser.id, { new: true })
        if (!deletedUser) {
            console.log({
                api_error_message: "failed to delete the user from the data base!"
            })
            // restoring all assets again
            const restoringPublicIDs = [profilePublicId, syndicatePubliceId, ministryPublicId, CVpublicId]
            const restoringPaths = [profilePath, syndicatepath, ministryPath, CVpath]
            let i = 0
            try {
                const assetsRestoring = await Promise.all(restoringPublicIDs.map(async (public_id) => {
                    await restoreAssetPromise(public_id, restoringPaths[i])
                    i++
                }))
                console.log({
                    message: "user assets are restored successfully!"
                })
            } catch (error) {
                console.log({
                    api_error_message: "An error occurred while trying to restore the user's assets",
                    error: error
                })
            }
            return next(new Error("failed to delete the user !", { cause: 500 }))
        }
    }
    console.log({
        message: "user is deleted successfully",
        deletedUser: deletedUser
    })
    // emptying the variables
    coverPictureId = null; profilePublicId = null; CVpublicId = null; syndicatePubliceId = null
    ministryPublicId = null; userFolderPath = null; CVpath = null; syndicatepath = null;
    ministryPath = null; coverPath = null; profilePath = null

    console.log("\nAUTH DELETE USER DONE!\n")
    res.status(200).json({
        message: "user is deleted successfully!",
        deleted_user_data: {
            name: deletedUser.userName,
            email: deletedUser.email,
            token: deletedUser.token,
            profilePicture: deletedUser.profilePicture.secure_url
        }
    })
}