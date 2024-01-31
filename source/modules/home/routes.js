import {
    Router, historyMP_cont, historyMP_vs, isAuth,
    multerHostFunction, validationCoreFunction, allowedExtensions,
    asyncHandler
} from './routes.imports.js'

const router = Router()

router.post(
    '/addData',
    multerHostFunction(allowedExtensions.image).single('image'),
    validationCoreFunction(historyMP_vs.addPlaceSchema),
    asyncHandler(historyMP_cont.addData)
)

router.patch(
    '/editData',
    multerHostFunction(allowedExtensions.image).single('image'),
    validationCoreFunction(historyMP_vs.editPlaceSchema),
    asyncHandler(historyMP_cont.editData)
)

router.get(
    '/getPlaceInfo',
    validationCoreFunction(historyMP_vs.editPlaceSchema),
    asyncHandler(historyMP_cont.getPlaceData)
)

router.get(
    '/getAllPlacesThumbs',
    validationCoreFunction(historyMP_vs.getAllPlacesSchema),
    asyncHandler(historyMP_cont.getAllPlaces)
)

router.delete(
    '/deletePlace',
    validationCoreFunction(historyMP_vs.deletePlaceSchema),
    asyncHandler(historyMP_cont.deletePlace)
)

export default router