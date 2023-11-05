import DBconnection from "../dataBase/connection.js"
import * as routers from '../modules/index.router.js'
import { GeneralResponse } from "./general.response.js"
import { ReasonPhrases, StatusCodes } from "http-status-codes"
import cors from 'cors'

const initiateApp = (app, express) => {
    const port = +process.env.PORT || 5000
    DBconnection()

    app.use(express.json())
    app.use(cors())

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