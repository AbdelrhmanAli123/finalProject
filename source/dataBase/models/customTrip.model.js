import { model, Schema } from 'mongoose'

export const categoryValues = ['Cultural Centers', 'Religious Sites', 'Natural Landmarks', 'Historical landmark', 'Bazaar', 'Entertainment Centers', 'Malls']

const schema = new Schema({
    tourist: {
        type: Schema.Types.ObjectId,
        ref: 'Tourist'
    },
    placeName: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true,
        min: 0
    },
    longitude: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        enum: categoryValues
    },
    government: {
        type: String,
    },
    activity: {
        type: String,
    },
    image: {
        type: String,
    },
    priceRange: {
        type: Number,
        min: 0
    }
})

export const customTripModel = model('customTrip', schema)