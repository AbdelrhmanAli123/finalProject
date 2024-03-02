import DBconnection from "../dataBase/connection.js"
import * as routers from '../modules/index.router.js'
import { GeneralResponse } from "./general.response.js"
import { ReasonPhrases, StatusCodes } from "http-status-codes"
import { getIo, initiateIo } from './ioGeneration.js'
import timeout from 'connect-timeout'
import cors from 'cors'

import { touristModel } from '../dataBase/models/tourist.model.js'
import { tourGuideModel } from '../dataBase/models/tourGuide.model.js'
import { checkUserExists } from '../utilities/signUpCheck.js'

const initiateApp = (app, express) => {
    const port = +process.env.PORT || 5000
    DBconnection()

    app.use(express.json()) // for parsing
    app.use(cors())
    // app.use(timeout('15s'))
    // app.use((req, res, next) => {
    //     if (!req.timedout) {
    //         next
    //     } else {
    //         res.status(408).json({
    //             message: "request timed out!"
    //         })
    //     }
    // })
    // app.use((req, res, next) => {
    //     res.setTimeout(500, () => {
    //         res.status(500).json({
    //             message: "request times out!"
    //         })
    //     })
    // })

    app.use('/auth', routers.authRouter)
    app.use('/home', routers.homeRouter)

    app.all('*', (req, res, next) => {
        res.status(StatusCodes.NOT_FOUND).json({
            message: "URL not found! ",
            Reason: ReasonPhrases.NOT_FOUND
        })
    })
    app.use(GeneralResponse)
    const server = app.listen(port, () => {
        console.log(`server is running successfully on port ${port} !`)
    })
    let clients = {}
    const io = initiateIo(server)
    io.on('connection', (socket) => {
        console.log({
            message: "socket connected!",
            socketId: socket.id
        })
        socket.on('signing', async (id) => {
            console.log(id);
            const userData = await checkUserExists(id)
            if (userData.found == true) {
                clients[id] = socket
            }
            clients[id] = socket;
            console.log(clients);
        });
        socket.on("message", async (msg) => {
            console.log(msg);
            const userData = await checkUserExists(msg.source)
            if (userData.found == true) {
                if (clients[msg.source]) {
                    // the source exists and valid
                    if (clients[msg.targetId]) {
                        clients[msg.targetId].emit("message", msg)
                    }
                }
            }
        });

        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });
    })
}

export default initiateApp