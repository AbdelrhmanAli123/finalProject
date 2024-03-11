import { Schema, model } from 'mongoose'
import { tourGuideModel } from './tourGuide.model.js'
import { touristModel } from './tourist.model.js'

const imageSchema = new Schema({
    secure_url: {
        type: String,
        required: true
    },
    public_id: {
        type: String,
        required: true
    }
})

const utilsOBJ = {
    PRoles: {
        type: String,
        enum: ['Tourist', 'TourGuide'],
    },
    // TODO : use this later
    messageTypes: {
        type: 'union',
        objectTypes: ['String', `${imageSchema}`]
    }
}

const schema = new Schema({
    PRoles: {
        type: String,
        enum: ['Tourist', 'TourGuide'],
        required: false,
        select: false // select : false makes this field to be hidden , you can't see it in the responses from the queries nor update it or include it
    },
    POne: { // first sender
        ID: {
            type: Schema.Types.ObjectId,
            refPath: `${utilsOBJ.PRoles}`,
            required: true
        },
        image: {
            secure_url: String
        },
        name: {
            type: String,
            required: true
        }
    },
    PTwo: { // first receiver
        ID: {
            type: Schema.Types.ObjectId,
            refPath: 'PRoles',
            required: true
        },
        image: {
            secure_url: String
        },
        name: {
            type: String,
            required: true
        }
    },
    messages: [
        {
            from: {
                type: Schema.Types.ObjectId,
                refPath: 'PRoles',
                required: true
            },
            to: {
                type: Schema.Types.ObjectId,
                refPath: 'PRoles',
                required: true
            },
            // first , define it as a string
            message: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                required: true
            },
            // status: ['sent','delivered','seen','played']
        }
    ],
    lastDate: {
        type: Date
    }
}, {
    timestamps: true
})

// pre and post are some sore of automation , i want to automate the saving of 'lastDate' field to be exactly the same as the last messages.date field
schema.pre('save', async function (next) {
    const getUser = await Promise.all([
        touristModel.findById(this.POne.ID).select('profilePicture.secure_url userName'),
        tourGuideModel.findById(this.POne.ID).select('profilePicture.secure_url firstName'),
        touristModel.findById(this.PTwo.ID).select('profilePicture.secure_url userName'),
        tourGuideModel.findById(this.PTwo.ID).select('profilePicture.secure_url firstName')
    ])
    if (getUser[0]) {
        if (getUser[0].profilePicture) {
            this.POne.image.secure_url = getUser[0].profilePicture.secure_url
            this.POne.name = getUser[0].userName
        }
    } else if (getUser[1]) {
        if (getUser[1].profilePicture) {
            this.POne.image.secure_url = getUser[1].profilePicture.secure_url
            this.POne.name = getUser[1].firstName
        }
    }

    if (getUser[2]) {
        if (getUser[2].profilePicture) {
            this.PTwo.image.secure_url = getUser[2].profilePicture.secure_url
            this.PTwo.name = getUser[2].userName
        }
    } else if (getUser[3]) {
        if (getUser[3].profilePicture) {
            this.PTwo.image.secure_url = getUser[3].profilePicture.secure_url
            this.PTwo.name = getUser[3].firstName
        }
    }

    if (this.isModified('messages')) {
        if (this.messages.length > 0) {
            const nowDate = Date.now()
            this.messages[this.messages.length - 1].date = nowDate
            const letMessageDate = this.messages[this.messages.length - 1].date
            this.lastDate = letMessageDate
        }
    }
    next()
})

export const chatModel = model('Chat', schema)

// const getPOne = await Promise.all([
//     touristModel.findById(this.POne.ID).select('profilePicture.secure_url'),
//     tourGuideModel.findById(this.POne.ID).select('profilePicture.secure_url')
// ])
// if (getPOne[0]) {
//     if (getPOne[0].profilePicture) {
//         this.POne.image.secure_url = getPOne[0].profilePicture.secure_url
//     }
// } else if (getPOne[1]) {
//     if (getPOne[1].profilePicture) {
//         this.POne.image.secure_url = getPOne[1].profilePicture.secure_url
//     }
// }

// const getPTwo = await Promise.all([
//     touristModel.findById(this.PTwo.ID).select('profilePicture.secure_url'),
//     tourGuideModel.findById(this.PTwo.ID).select('profilePicture.secure_url')
// ])
// if (getPTwo[0]) {
//     if (getPTwo[0].profilePicture) {
//         this.PTwo.image.secure_url = getPTwo[0].profilePicture.secure_url
//     }
// } else if (getPTwo[1].profilePicture) {
//     this.PTwo.image.secure_url = getPTwo[1].profilePicture.secure_url
// }