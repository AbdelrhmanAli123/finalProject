import {
    FormData, TourGuideTripsModel, axios, cloudinary, customAlphabet,
    emailService, generateToken, statuses, systemRoles, tourGuideModel,
    touristModel, tripDaysModel, verifyToken, ReasonPhrases, StatusCodes,
    TGtripStatuses, bcrypt, slugify, deleteAsset, deleteFolder,
    restoreAsset, restoreAssetPromise
} from './controller.imports.js'

const nanoid = customAlphabet('asdqwezxcbnmjkl_#$', 5)

export const generateTrip = async (req, res, next) => { // TODO : test this API on the new changes
    console.log("\nTG GENERATE TRIP API\n")
    const { _id } = req.authUser // tourGuide _id
    // tripDetails -> array of objects + don't forget the image
    const { title, brief, ticketPerPerson, minimumNumber, tripDetails } = req.body
    console.log({
        tripDetails
    })
    for (const day of tripDetails) {
        console.log({
            day: day,
            dayName: day.dayName,
            places: day.dayPlaces,
        })
    }

    if (minimumNumber <= 0) {
        console.log({
            user_error_message: "user entered a number less than or equal zero",
            entered_minimum_number: minimumNumber
        })
        return next(new Error('the minimum number of tourists must be at least 1', { cause: 400 }))
    }
    console.log({ message: "minimum number is valid" })

    if (ticketPerPerson < 0) {
        console.log({
            user_error_message: "user entered a ticket price less than zero",
            entered_ticket_price: ticketPerPerson
        })
        return next(new Error('the ticket price per person must be at least 0', { cause: 400 }))
    }
    console.log({ message: "ticket price is valid" })

    const tripData = {
        title,
        brief,
        ticketPerPerson,
        minimumNumber,
        createdBy: _id,
    }

    let tripDaysData = [] // _id array
    for (const day of tripDetails) {
        console.log({ message: "about to save day data" })
        const data = await tripDaysModel.create(day)
        if (data.errors) {
            console.log({
                api_error_message: "error in saving the trip details!",
                error_info: data.errors
            })
            return next(new Error('failure in saving the trip details!', { cause: 500 }))
        }
        tripDaysData.push(data._id)
    }

    tripData.tripDetails = tripDaysData
    console.log({ message: "tripDays are saved" })

    // image uploading

    if (req.file) {
        const customId = nanoid()
        tripData.customId = customId
        let imagePath = `${process.env.PROJECT_UPLOADS_FOLDER}/trips/${customId}`
        let secure_url, public_id

        try {
            const upload = await cloudinary.uploader.upload(req.file.path, {
                folder: imagePath
            })
            secure_url = upload.secure_url
            public_id = upload.public_id
            console.log({ message: "image uploaded successfully!" })
        } catch (error) {
            console.log({
                api_error_message: "failed to upload the trip image",
                error: error
            })
            return next(new Error('failed to upload the trip image!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        }
        tripData.image = {
            secure_url,
            public_id
        }
    }

    const newTrip = await TourGuideTripsModel.create(tripData)
    if (newTrip.errors) {
        console.log({
            api_error_message: "failed to create the trip",
            errors: newTrip.errors
        })
        return next(new Error('failure in saving the trip!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    console.log({ message: "trip is saved successfully!" })

    req.authUser.createdTrips.push(newTrip._id)
    await req.authUser.save()
    console.log({ message: "tourGuide has been added this trip creation!" })

    console.log("\nTG GENERATE API DONE!\n")
    res.status(StatusCodes.OK).json({
        message: "trip saving is successfull!",
        trip_created: newTrip
    })
}

export const editTrip = async (req, res, next) => {
    console.log("\nEDIT TRIP API\n")
    console.log({ authUser: req.authUser })
    const _id = req.authUser._id
    // TODO : make sure that this user is the one who made that trip
    const {
        title, brief, ticketPerPerson, minimumNumber, newTripDetails, trip_id,
        newDay, removeDay
    } = req.body
    // newDay -> new day with it's data
    // removeDay -> _id of the day desired to be removed

    const getTrip = await TourGuideTripsModel.findOne({
        $and: [
            { _id: trip_id },
            { createdBy: _id }
        ]
    })
    if (getTrip.errors) {
        console.log({
            user_error_message: "failed to find the trip , invalid _id",
            errors: getTrip.errors
        })
        return next(new Error('trip not found!', { cause: StatusCodes.BAD_REQUEST }))
    }
    console.log({
        message: "trip found!",
        trip: getTrip
    })

    if (title) {
        getTrip.title = title
        console.log({ message: "title is found and updated!" })
    }

    if (brief) {
        getTrip.brief = brief
        console.log({ message: "brief is found and updated!" })
    }

    if (ticketPerPerson) {
        if (ticketPerPerson < 0) {
            console.log({
                user_error_message: "user entered a ticket price less than zero",
                entered_ticket_price: ticketPerPerson
            })
            return next(new Error('the ticket price per person must be at least 0', { cause: 400 }))
        }
        getTrip.ticketPerPerson = ticketPerPerson
        console.log({ message: "ticket price is found and updated!" })
    }

    if (minimumNumber) {
        if (minimumNumber <= 0) {
            console.log({
                user_error_message: "user entered a number less than or equal zero",
                entered_minimum_number: minimumNumber
            })
            return next(new Error('the minimum number of tourists must be at least 1', { cause: 400 }))
        }
        getTrip.minimumNumber = minimumNumber
        console.log({ message: "minimum number is found and updated!" })
    }

    // TODO : finish this part of the code !
    // case 1 : a new array will be inserted -> request shall have that new array of days
    if (newTripDetails) {
        // you need to first delete these tripDays from the tripDays model
        let newDaysIds = []
        const oldTripDetails = getTrip.tripDetails // these are _ids , you need to delete them each
        const deletdTripDetails = await tripDaysModel.deleteMany({
            _id: { $in: oldTripDetails }
        }) // TODO : edit the query
        if (!deletdTripDetails.acknowledged) {
            console.log({
                message: "failed to delete the old trip details"
            })
            return next(new Error('failed to delete the old trip details', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        }
        console.log({
            message: "old trip details are deleted successfully!",
            deleted_trip_details: deletdTripDetails.deletedCount
        })

        const newTripDays = await tripDaysModel.insertMany(newTripDetails)
        if (!newTripDays.length) {
            console.log({
                api_error_message: "error in saving the new trip details!",
                error_info: data.errors
            })
            return next(new Error('failure in saving the new trip details!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        }
        for (const doc of newTripDays) {
            console.log({
                message: "document",
                data: doc
            })
            newDaysIds.push(doc._id)
        }
        getTrip.tripDetails = newDaysIds
        console.log({
            message: "trip details are updated!",
            new_trip_details: getTrip.tripDetails
        })
    }

    // case 2 : a new day will be added -> request shall have that new day with it's data
    else if (newDay) { // you will add a new day (after the rest of the days , ex: add day5 after day4)
        console.log({
            trip_details_before_pushing: getTrip.tripDetails
        })
        const data = await tripDaysModel.create(newDay)
        if (data.errors) {
            console.log({
                message: "error regarding the new day inserting",
                errors: data.errors,
            })
            return next(new Error('failure in saving the new day!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        }
        getTrip.tripDetails.push(data._id)
        console.log({
            message: "trip details has been updated!",
            trip_details_after_pushing: getTrip.tripDetails
        })
    }

    // case 3 : an existing day will be removed -> request shall have that day_id to be removed
    else if (removeDay) { // remove day is an _id of the day we want to delete
        console.log({
            trip_details_before_removing: getTrip.tripDetails
        })
        const deletedDay = await tripDaysModel.findByIdAndDelete(removeDay)
        if (!deletedDay) { // don't use deletedDay.ok otherwise compare it with "==" or "==="
            console.log({
                message: "error in deleting the desired day!",
            })
            return next(new Error('error in deleting the desired day!'), { cause: StatusCodes.INTERNAL_SERVER_ERROR })
        }
        for (let i = 0; i < getTrip.tripDetails.length; i++) {
            if (getTrip.tripDetails[i] === removeDay) { // try without ._id , if error -> try with it
                getTrip.tripDetails.splice(i, 1)
            }
        }
        console.log({
            message: "day is removed!",
            trip_details_after_removing: getTrip.tripDetails
        })
    }

    if (req.file) {
        let path
        if (getTrip.customId) {
            path = `${process.env.PROJECT_UPLOADS_FOLDER}/trips/${getTrip.customId}`
            console.log({ message: "user had a custom id!", existing_customId: getTrip.customId, cusomtId_length: getTrip.customId?.length })
        }
        else if (!getTrip.customId) {
            const newCustomId = nanoid()
            getTrip.customId = newCustomId
            path = `${process.env.PROJECT_UPLOADS_FOLDER}/trips/${newCustomId}`
            console.log({ message: "user had no path and got one created!" })
        }
        try {
            try {
                console.log({ message: "starting to check if the user has an image or not!" })
                const exists = await cloudinary.api.resource(getTrip.image?.public_id)
                console.log({ message: "image checking is done without throwing an error!" })
                if (exists) {
                    console.log({ message: "there is an asset found!" })
                    await cloudinary.api.delete_resources_by_prefix(getTrip.image.public_id)
                }
            } catch (error) {
                console.log({ message: "user  didn't have any images" })
            }
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
                folder: path
            })
            getTrip.image.secure_url = secure_url
            getTrip.image.public_id = public_id
            console.log({ message: "image is updated!" })
        } catch (error) {
            console.log({
                api_error_message: "failure regarding image updating!",
                error: error
            })
            return next(new Error('failure regarding image updating!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        }
    } else {
        console.log({
            message: "there are no tripDetails editing requested!"
        })
    }

    try {
        await getTrip.save()
        console.log({
            message: "trip is updated!",
            updated_trip: getTrip
        })
    } catch (error) {
        console.log({
            api_error_message: "error regarding trip editing!",
            error: error
        })
    }

    console.log("\nEDIT TRIP API DONE\n")
    res.status(StatusCodes.OK).json({
        message: "trip editing is successfull!",
        editedTrip: getTrip
    })
}

export const deleteTrip = async (req, res, next) => {
    console.log("\nDELETE TRIP API!\n")

    const { _id } = req.authUser
    const { trip_id } = req.body

    const getTrip = await TourGuideTripsModel.findOne({
        $and: [
            { _id: trip_id },
            { createdBy: _id }
        ]
    })
    if (!getTrip) {
        console.log({
            user_error_message: "failed to find the trip , either user didn't create that trip or the trip doesn't exist",
        })
        return next(new Error("failed to find the trip , either user didn't create that trip or the trip doesn't exist", { cause: StatusCodes.BAD_REQUEST }))
    }
    console.log({
        message: "trip is found!",
        trip: getTrip
    })

    // delete the associated tripDays , the image then the trip itself
    let deletedTrip
    try { // TODO : ADD SOFT DELETE if what's after this has failed , you must retrieve this document -> solved by soft delete
        deletedTrip = await TourGuideTripsModel.findByIdAndDelete(trip_id)
        console.log({
            message: "trip is deleted successfully!",
            deleted_trip: deletedTrip
        })
    } catch (error) {
        console.log({
            api_error_message: "failed to delete the trip",
            error: error
        })
        return next(new Error('failed to delete the trip!', { cause: 500 }))
    }
    // req.deletedTrip = deletedTrip

    const deletedTripDays = await tripDaysModel.deleteMany({
        _id: getTrip.tripDetails
    })
    if (!deletedTripDays) {
        console.log({
            api_error_message: "failed to delete the associated trip details!",
        })
        const retrievedTrip = await TourGuideTripsModel.create(getTrip.toJSON)
        return next(new Error('failed to delete the trip details , requires database cleansing!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    console.log({
        message: "trip associated details are deleted!",
        deleted_trip_details: deletedTripDays,
        count: deletedTripDays.deletedCount
    })

    let trip_publicId = getTrip.image.public_id
    let trip_path = `${process.env.PROJECT_UPLOADS_FOLDER}/trips/${getTrip.customId}`
    const deleteImage = await deleteAsset(trip_publicId, trip_path)
    console.log({ deletion_return: deleteImage })
    if (deleteImage.notFound === true) { // NOTE : always handle this condition first because there might be cases where the return has both but never notFound only to apply the condition
        console.log({
            api_error_message: "image didn't exist!"
        })
    }
    else if (deleteImage.deleted === false) {
        console.log({
            api_error_message: "failed to delete the image , requires manual deletion!"
        })
        return next(new Error('failed to delete the image , requires manual deletion!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    console.log({ message: "trip image is deleted!" })

    console.log("\nDELETE TRIP API IS DONE!\n")
    res.status(StatusCodes.OK).json({
        message: "trip is deleted successfully!",
        deleted_trip: deletedTrip
    })
}

export const getAllTrips = async (req, res, next) => {
    // this api gets all the associated trips of the tourGuide

    console.log("\nGET TRIP API!\n")
    const { _id } = req.authUser
    // const { trip_id } = req.body

    const getTrip = await TourGuideTripsModel.find({
        createdBy: _id // untill here , we get all the trips that the tourGuide made
    }).populate([
        {
            path: 'tripDetails' // we here populate all the tripDetails of each trip
        }
    ])
    if (getTrip.errors) {
        console.log({
            user_error_message: "failed to find the trip , either user didn't create that trip or the trip doesn't exist",
            errors: getTrip.errors
        })
    }
    console.log({
        message: "trip is found!",
        trip: getTrip
    })

    console.log("\nGET TRIP API IS DONE!\n")
    res.status(StatusCodes.OK).json({
        message: "trips are found!",
        trips: getTrip
    })

} // phase 1 -> tourGuide does it

// phase 2 -> tourist will do it

// docker compose , docker network , git , linux , kubernetes , helm , 1:30 mins