import { touristModel } from "../../../../dataBase/models/tourist.model.js"
import { TourGuideTripsModel } from "../../../../dataBase/models/tourGuideTrips.model.js"
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { AItripModel } from '../../../../dataBase/models/AItrip.model.js'
import { customTripModel } from '../../../../dataBase/models/customTrip.model.js'

// TODO : add the custom trip data base model when it's created .
// TODO : make a cron job that checks regularly the trips of each tourist and change their status according to their date .
// TODO : add in each trip schema the "date status" field that allows you to complete the task and filter the trips according to their date
// REQUIRED : i need a method that takes the date string and converts it into a number and vise versa
// from string to number : use Date.parse()

export const getAllTrips = async (req, res, next) => {
    console.log("\nTOURIST GET TRIPS HISTORY API!\n")

    const tourist = req.authUser
    const getTrips = await Promise.all([
        TourGuideTripsModel.find({
            subscribers: { $in: tourist._id }
        }),
        AItripModel.find({
            touristId: tourist._id
        }),
        customTripModel.find({
            tourist: tourist._id
        })
    ])
    // let current = []
    // let upcoming = []
    // let completed = []

    // if (getTrips[0].length) {
    //     console.log("tour guide trips are found!")
    //     getTrips[0].forEach(trip => {
    //         console.log(Date.parse(trip.from));
    //         console.log(typeof (Date.parse(trip.to)));
    //         console.log(Date.now().valueOf())
    //     });
    //     res.status(StatusCodes.OK).json({
    //         message: "trips are found!",
    //         tourGuideTrips: getTrips[0],
    //         AI_trips: getTrips[1]
    //     })
    // }
    // if (getTrips[0].length !== null || getTrips[1].length !== null) {
    //     console.log("trips are found!")
    //     return res.status(StatusCodes.OK).json({
    //         message: "trips are found!",
    //         tourGuideTrips: getTrips[0],
    //         AI_trips: getTrips[1]
    //     })
    // } else {
    //     return res.status(StatusCodes.NO_CONTENT).json({})
    // }
    res.status(StatusCodes.OK).json({
        tourGuideTrips: getTrips[0],
        AITrips: getTrips[1],
        customTrips: getTrips[2]
    })
}
