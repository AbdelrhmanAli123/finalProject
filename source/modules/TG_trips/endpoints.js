import { systemRoles } from "../../utilities/systemRoles.js"

export const tripAPIroles = {
    createTrip: [systemRoles.tourGuide],
    editTrip: [systemRoles.tourGuide]
}