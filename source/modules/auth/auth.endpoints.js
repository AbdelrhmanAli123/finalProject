import { systemRoles } from "../../utilities/systemRoles.js"

export const authAPIroles = {
    changePassword: [systemRoles.tourist, systemRoles.tourGuide], // confirm old pass and change old pass
    deleteUser: [systemRoles.tourist, systemRoles.tourGuide],
    logout: [systemRoles.tourist, systemRoles.tourGuide],
    getUserInfo: [systemRoles.tourist, systemRoles.tourGuide],
}