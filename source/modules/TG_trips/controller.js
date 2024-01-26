import {
    FormData, TourGuideTripsModel, axios, cloudinary, customAlphabet,
    emailService, generateToken, statuses, systemRoles, tourGuideModel,
    touristModel, tripDaysModel, verifyToken, ReasonPhrases, StatusCodes,
    TGtripStatuses, bcrypt, slugify
} from './controller.imports.js'

const nanoid = customAlphabet('asdqwezxcbnmjkl_#$', 5)

export const generateTrip = async (req, res, next) => { // TODO : test this API on the new changes
    console.log("\nTG GENERATE TRIP API\n")
    const { _id } = req.authUser // tourGuide _id
    // tripDetails -> array of objects + don't forget the image
    const { title, brief, ticketPerPerson, minimumNumber, tripDetails } = req.body
    console.log({
        request: req,
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
    const { _id } = req.authuser
    // TODO : make sure that this user is the one who made that trip
    const {
        title, brief, ticketPerPerson, minimumNumber, newTripDetails, trip_id,
        newDay, removeDay
    } = req.body
    // newDay -> new day with it's data
    // removeDay -> _id of the day desired to be removed

    const getTrip = await TourGuideTripsModel.findById(trip_id)
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

        // save the new trip days in the trip days model
        // method 1
        // for (const day of newTripDetails) {
        //     const data = await tripDaysModel.create(day)
        //     if (data.errors) {
        //         console.log({
        //             api_error_message: "error in saving the new trip details!",
        //             error_info: data.errors
        //         })
        //         return next(new Error('failure in saving the new trip details!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        //     }
        //     newDaysIds.push(data._id)
        // }

        // method 2
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
    if (newDay) { // you will add a new day (after the rest of the days , ex: add day5 after day4)
        console.log({
            trip_details_before_pushing: getTrip.tripDetails
        })
        getTrip.tripDetails.push(newDay)
        console.log({
            message: "trip details has been updated!",
            trip_details_after_pushing: getTrip.tripDetails
        })
    }

    // case 3 : an existing day will be removed -> request shall have that day_id to be removed
    if (removeDay) {

    }

    if (req.file) {
        let path
        if (getTrip.customId) {
            path = `${process.env.PROJECT_UPLOADS_FOLDER}/trips/${getTrip.customId}`
            console.log({ message: "user had a path!" })
        }
        else {
            const newCustomId = nanoid()
            getTrip.customId = newCustomId
            path = `${process.env.PROJECT_UPLOADS_FOLDER}/trips/${newCustomId}`
            console.log({ message: "user had no path and got one created!" })
        }
        try {
            const exists = await cloudinary.api.resource(getTrip.image.public_id)
            if (exists) {
                await cloudinary.api.delete_resources_by_prefix(getTrip.image.public_id)
            }
            await cloudinary.uploader.upload(req.file.path, {
                folder: path
            })
            console.log({ message: "image is updated!" })
        } catch (error) {
            console.log({
                api_error_message: "failure regarding image updating!",
                error: error
            })
            return next(new Error('failure regarding image updating!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        }
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

}

export const getTrips = async (req, res, next) => {

} // phase 1 -> tourGuide does it

// phase 2 -> tourist will do it