import { Schema, model } from 'mongoose'
import { TGtripRequestStatuses } from '../../utilities/activityStatuses.js'

const schema = new Schema({
    requestedBy: {
        ID: {
            type: Schema.Types.ObjectId,
            ref: 'Tourist',
            required: true
        },
        systemEmail: {
            type: String,
            required: true
        },
        userName: {
            type: String,
            required: true
        },
        image: { // include the secure url directly .
            type: String
        },
        email: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: false
        },
        countryFlag: {
            type: String,
            required: false
        },
        phoneNumber: {
            type: String,
            required: false
        },
        age: {
            type: Number,
            required: false,
        },
        totalPrice: Number,
    },

    requestedTo: {
        type: Schema.Types.ObjectId,
        ref: 'TourGuide',
        required: true
    },

    requestedTrip: {
        ID: {
            type: Schema.Types.ObjectId,
            ref: 'TourGuideTrip',
            required: true
        },
        image: {
            type: String
        },
        title: {
            type: String,
        },
        brief: {
            type: String
        }
    },
    requestDetails: {
        tripType: {
            type: String,
            enum: ['standard', 'luxury', 'VIP'],
            default: 'standard'
        },
        startDate: {
            type: String
        },
        additionalTravelersNo: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    requestStatus: {
        type: String,
        enum: [TGtripRequestStatuses.accepted, TGtripRequestStatuses.rejected, TGtripRequestStatuses.not_handled],
        default: TGtripRequestStatuses.not_handled
    },
    requestComment: {
        type: String,
        min: 0,
        max: 255 // maybe 50 words
    }
})

export const TGtripReqsModel = model('TourGuideTripRequest', schema)