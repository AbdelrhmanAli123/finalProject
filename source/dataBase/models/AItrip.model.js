import { Schema, model } from 'mongoose'
import { TGtripStatuses } from '../../utilities/activityStatuses.js'

const DayPlacesSchema = new Schema({
    placeName: String,
    longitude: Number,
    latitude: Number,
    activity: String,
    category: String
})

const schema = new Schema({
    tripDetails: {
        type: Map,
        of: [DayPlacesSchema]
    },
    touristId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    status: { // NOTE: can be determined fr
        type: String,
        required: false,
        default: TGtripStatuses.empty,
        enum: [
            TGtripStatuses.complete, TGtripStatuses.done, TGtripStatuses.empty,
            TGtripStatuses.pending, TGtripStatuses.started
        ]
    },
    title: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
})

export const AItripModel = model('AItrip', schema)