import DBconnection from "../dataBase/connection.js"
import * as routers from '../modules/index.router.js'
import { GeneralResponse } from "./general.response.js"
import { ReasonPhrases, StatusCodes } from "http-status-codes"
import timeout from 'connect-timeout'
import cors from 'cors'

const initiateApp = (app, express) => {
    const port = +process.env.PORT || 5000
    DBconnection()

    app.use(express.json())
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

    app.use('/tourist', routers.touristRouter)

    app.all('*', (req, res, next) => {
        res.status(StatusCodes.NOT_FOUND).json({
            message: "URL not found! ",
            Reason: ReasonPhrases.NOT_FOUND
        })
    })
    app.use(GeneralResponse)
    app.listen(port, () => {
        console.log(`server is running successfully on port ${port} !`)
    })
}

export default initiateApp