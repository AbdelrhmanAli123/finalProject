// import airlabs from 'airlabs'

// const airlabsInst = new airlabs(process.env.airlabs_api_key, 9)

// airlabsInst.api('airports', { code: 'PAR' }, function (error, response) {
//     console.log(response)
// })

// export const airlabsTest1 = async (req, res, next) => {
//     const { code } = req.body
//     let airlabsResponse
//     airlabsInst.api('countries', { code: code }, function (error, response) {
//         console.log(response)
//         airlabsResponse = response
//     })
//     res.status(200).json({
//         message: "airlabse response is successfull!",
//         airlabs_response: airlabsResponse
//     })
// }

// there are 2 ways :
// 1. to use the axios directly
// 2. to use the airlabs api first

// 