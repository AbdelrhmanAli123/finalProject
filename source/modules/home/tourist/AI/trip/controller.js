import {
    touristModel, AItripModel, StatusCodes
} from './cont.imports.js'

export const createAItrip = async (req, res, next) => {
    const getUser = req.authUser
    // TODO : make a variable in the req.body that has the tripData of the AI generated trip
    // req.body has nothing but the result of the AI model
    let saveTrip
    try {
        saveTrip = await AItripModel.create({ tripDetails: req.body, touristId: getUser._id })
        console.log({ message: "tripData is saved successfully!" })
    } catch (error) {
        console.log({ error })
        return next(new Error('error in savving the data in the data base!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    res.status(StatusCodes.OK).json({
        message: "AItrip is saved!", // ##
        saved_AI_trip_for_testing: saveTrip
    })
}

export const getTrip = async (req, res, next) => {
    const getUser = req.authUser
    const { tripId } = req.body
    const getTrip = await AItripModel.findOne({
        touristId: getUser._id,
        _id: tripId
    })
    res.status(StatusCodes.OK).json({
        message: "trip is found!",
        found_ai_trip: getTrip
    })
}