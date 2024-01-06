import { Schema, model } from "mongoose"
import { systemRoles } from "../../utilities/systemRoles.js"
import { statuses } from "../../utilities/activityStatuses.js"

// TODO : add contact info

const schema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    firsNameSlug: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    lastNameSlug: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    address: { // TODO : search on longitude and latitude and how to get an address as a string
        type: String,
        required: true
    },
    birthDate: { // TODO : later in the project , create a format to it , untill now it is a string
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    phoneNumber: {
        type: String,
        required: true
    },
    languages: { // array of strings
        type: [String],
        required: true
    },
    // images
    profilePicture: {
        secure_url: {
            type: String
        },
        public_id: {
            type: String
        }
    },
    // ministry ID (ministry liscence in backend) -> 1 image
    ministyliscence: { // not in the ocr
        // image
        secure_url: {
            type: String
        },
        public_id: {
            type: String
        }
    },
    syndicateLiscence: { // ocr
        // image
        secure_url: {
            type: String
        },
        public_id: {
            type: String
        }
    },
    CV: { // CV 
        // file -> pdf 
        secure_url: {
            type: String
        },
        public_id: {
            type: String
        }
    },
    customId: String,
    token: String, // login token
    // user statuses
    status: {
        type: String,
        enum: [statuses.online, statuses.offline, statuses.doNotDisturb],
        default: statuses.offline
    },
    verified: {
        type: Boolean,
        default: false
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    resetCode: String, // reset code (password reset)
    forgetPassword: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: [systemRoles.tourGuide],
        default: systemRoles.tourGuide
    },
    contact_info: {
        whatsApp: {
            type: String
        },
        facebook: {
            type: String
        },
        instagram: {
            type: String
        },
        twitter: {
            type: String
        },
        linkedIn: {
            type: String
        }
    }
    // generatedTrips: {

    // }
})

// another image , contact info , additional CV or liscences

// generate trips model

// generate trip by the tourguide 

export const tourGuideModel = model('TourGuide', schema)