import {
    TourGuideTripsModel, paginate, tourGuideModel, touristModel, tripDaysModel,
    cloudinary, emailService
} from './controller.imports.js'
import { getIo } from '../../../../../utilities/ioGeneration.js'

export const getAllTrips = async (req, res, next) => {
    const getUser = req.authUser
    console.log({ query: req.query })
    const excludeQueryParams = ['page', 'size', 'sort', 'search', 'fields']
    const filterQuery = { ...req.query }
    excludeQueryParams.forEach(param => {
        delete filterQuery[param]
    })

    const mongooseQuery = TourGuideTripsModel.find(
        JSON.parse(JSON.stringify(filterQuery).replace(/(gt|gte|lt|lte|in|nin|eq|neq)/g), match => `$${match}`)
    )

    if (req.query.sort) {
        mongooseQuery.sort(req.query.sort.replaceAll(",", " "))
    }

    if (req.qeury.page && req.query.size) {
        const { skip, limit } = paginate(req.query.page, req.query.size)
        mongooseQuery.limit(limit).skip(skip)
    }

    const result = await mongooseQuery
    res.status(200).json({
        tourGuideTrips: result
    })
}