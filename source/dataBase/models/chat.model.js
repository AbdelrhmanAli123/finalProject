import { Schema, model } from 'mongoose'

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
        required: true
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
        required: true
    },
    POne: { // first sender
        type: Schema.Types.ObjectId,
        refPath: `${utilsOBJ.PRoles}`,
        required: true
    },
    PTwo: { // first reciever
        type: Schema.Types.ObjectId,
        refPath: 'PRoles',
        required: true
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
            }
            // date,
            // status: ['sent','delivered','seen','played']
        }
    ]
}, {
    timestamps: true
})

export const chatModel = model('Chat', schema)