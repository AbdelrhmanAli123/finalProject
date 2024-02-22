import { Schema, model } from 'mongoose'

const schema = new Schema({
    tripDetails: Object,
    touristId: {
        type: Schema.Types.ObjectId,
        required: true
    }
})

export const AItripModel = model('AItrip', schema)