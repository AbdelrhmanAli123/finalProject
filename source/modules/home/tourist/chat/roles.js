import { systemRoles } from '../../../../utilities/systemRoles.js'
const APIroles = {
    getRecentChat: [systemRoles.tourist],
    getChat: [systemRoles.tourist],
    getTGMeta: [systemRoles.tourist],
    sendMessage: [systemRoles.tourist]
}

export default APIroles
