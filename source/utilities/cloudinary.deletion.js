import cloudinary from "../services/cloudinary"

export const deleteAsset = async (public_id, folderPath) => {
    try {
        await cloudinary.api.resource(public_id)
        console.log({ message: "asset is found!" })
        await cloudinary.api.delete_resources_by_prefix(public_id)
        console.log({ message: "asset is deleted" })
        await cloudinary.api.delete_folder(folderPath)
        return true
    } catch (error) {
        console.log({ message: "failed to delete the asset" })
        return false
    }
}

export const restoreAsset = async (public_id, folderPath) => {
    try {
        await cloudinary.api.create_folder(folderPath, { resource_type: 'raw' })
        console.log({ message: "folder is recreated!" })
        await cloudinary.api.restore(public_id)
        console.log({ message: "" })
    } catch (error) {

    }
}