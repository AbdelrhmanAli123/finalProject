import { customTripModel } from "../../../../../dataBase/models/customTrip.model.js"
import { StatusCodes, ReasonPhrases } from 'http-status-codes'

export const createTrip = async (req, res, next) => {
    const getUser = req.authUser
    const { placeName, latitude, longitude, category, government, activity, image, priceRange } = req.body

    const saveTrip = await customTripModel.create({
        tourist: getUser._id, placeName, activity, category, government, image, latitude, longitude, priceRange
    })

    if (!saveTrip) {
        console.log('message : failed to save the trip in data base!');
        return next(new Error('error saving the trip in data base!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }

    res.status(StatusCodes.NO_CONTENT).json({})
}

export const getAllTrips = async (req, res, next) => {
    const getUser = req.authUser
    const getTrips = await customTripModel.find({
        tourist: getUser._id
    }).select('-_id -tourist')

    if (getTrips.length == 0) {
        console.log('message : there are no trips associated with the user!')
        return res.status(StatusCodes.NO_CONTENT).json({})
    }

    res.status(StatusCodes.OK).json({
        message: "trips are found!",
        trips: getTrips
    })
}

export const editTrip = async (req, res, next) => {
    const getUser = req.authUser
    const { tripId } = req.body

    const getTrip = await customTripModel.findOne({
        tourist: getUser._id,
        _id: tripId
    }
    )

    await customTripModel.updateOne(
        { _id: getTrip._id },
        {
            placeName: req.body.placeName || getTrip.placeName,
            latitude: req.body.latitude || getTrip.latitude,
            longitude: req.body.longitude || getTrip.longitude,
            category: req.body.category || getTrip.category,
            government: req.body.government || getTrip.government,
            activity: req.body.activity || getTrip.activity,
            image: req.body.image || getTrip.image,
            priceRange: req.body.priceRange || getTrip.priceRange
        }
    )

    res.status(StatusCodes.CREATED).json({
        message: "trip updated!"
    })
}

export const deleteTrip = async (req, res, next) => {
    const getUser = req.authUser
    const { tripId } = req.body

    const deleteTrip = await customTripModel.findOneAndDelete({
        _id: tripId,
        tourist: getUser._id
    })

    if (!deleteTrip) {
        console.log('message: failed to delete the document from database , the document may not exist')
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "the document does not exist !"
        })
    }

    res.status(StatusCodes.NO_CONTENT).json({})
}