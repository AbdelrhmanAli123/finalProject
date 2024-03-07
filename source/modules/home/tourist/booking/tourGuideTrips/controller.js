import {
    TourGuideTripsModel, paginate, tourGuideModel, touristModel, tripDaysModel,
    cloudinary, emailService, StatusCodes, getIo
} from './controller.imports.js'

export const getAllTrips = async (req, res, next) => {
    const getUser = req.authUser
    console.log({ query: req.query })
    const excludeQueryParams = ['page', 'size', 'sort', 'search', 'fields']
    const filterQuery = { ...req.query }
    excludeQueryParams.forEach(param => {
        delete filterQuery[param]
    })

    // filter query params example :   stock[$lte]=50 -> stock: {'$lte':'50'}

    // HANDLE THE FILTERING if it didn't exist and if it got errors 
    const mongooseQuery = TourGuideTripsModel.find(
        JSON.parse(JSON.stringify(filterQuery).replace(/(gt|gte|lt|lte|in|nin|eq|neq)/g, match => `$${match}`))
    )
    mongooseQuery.populate(
        [
            {
                path: 'createdBy',
                select: 'profilePicture.secure_url email'
            },
            {
                path: 'tripDetails'
            }
        ]
    )

    // JSON.parse(JSON.stringify(filterQuery).replace(/(gt|gte|lt|lte|in|nin|eq|neq)/g, match => `$${match}`))
    // select the profile image , email
    if (req.query.sort) {
        mongooseQuery.sort(req.query.sort.replaceAll(",", " "))
    }

    if (req.query.page && req.query.size) {
        const { skip, limit } = paginate(req.query.page, req.query.size)
        mongooseQuery.limit(limit).skip(skip)
    }

    const result = await mongooseQuery
    res.status(200).json({
        tourGuideTrips: result
    })
}

export const getTheTourGuideProfile = async (req, res, next) => {
    const getUser = req.authUser
    const { email } = req.body
    const getTourGuide = await tourGuideModel.findOne({ email })
        .select(
            '-_id firstName lastName email address birthDate description phoneNumber languages status verified createdTrips ministyliscence.secure_url syndicateLiscence.secure_url CV.secure_url profilePicture.secure_url'
        )
        .populate(
            {
                path: 'createdTrips'
            }
        )
    if (!getTourGuide) {
        console.log({
            error_message: "tour guide doesn't exist"
        })
        return next(new Error('tour guide is not found!', { cause: StatusCodes.BAD_REQUEST }))
    }
    // else {
    //     if (getTourGuide.errors !== null) {
    //         console.log({
    //             query_error_message: "error regarding the query",
    //             query_error: getTourGuide.errors?.message
    //         })
    //         return next(new Error('server-query error!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    //     }
    // }

    res.status(StatusCodes.OK).json({
        message: "tour guide is found!",
        tour_guide: getTourGuide
    })
}