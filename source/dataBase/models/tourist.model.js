import { Schema, model } from "mongoose"
import { systemRoles } from "../../utilities/systemRoles.js"

const touristSchema = new Schema({
    // userName , email , pass -> are the main data for request in sign Up , the rest should be not required
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
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
    gender: {
        type: String,
        enum: ['male', 'female', 'not specified'], // not specified -> means the user didn't say male or female
        defaul: 'not specified'
    },
    age: {
        type: Number,
    },
    phoneNumber: {
        type: String,
    },
    language: {
        type: String,
        default: 'English'
    },
    role: {
        type: String,
        enum: [systemRoles.tourist],
        default: systemRoles.tourist
    },
    profilePicture: {
        secure_url: {
            type: String,
        },
        public_id: {
            type: String,
        },
    },
    status: {
        type: String,
        enum: ['Online', 'Offline', 'Do not disturb'],
        default: 'Offline'
    },
    customId: String,
    confirmed: {
        type: Boolean,
        default: false
    },
    token: String, // login token
    resetCode: String, // reset code (password reset)
    forgetPassword: {
        type: Boolean,
        default: false
    },
    // resetToken:String
    // address: {
    // }
    // refreshCounter : {
    //     type:Number,
    //     max:4
    // }
})

export const touristModel = model('Tourist', touristSchema)