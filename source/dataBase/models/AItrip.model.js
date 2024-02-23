import { Schema, model } from 'mongoose'

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
    }
})

export const AItripModel = model('AItrip', schema)