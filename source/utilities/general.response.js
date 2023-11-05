export const GeneralResponse = (err, req, res, next) => {
    if (err) {
        if (req.validationErrors) {
            return res
                .status(err['cause'] || 400)
                .json({
                    message: req.validationErrors
                })
        }
        res.status(err.cause).json({
            message: err.message,
            status: err.cause
        })
    }
}