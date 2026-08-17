// Express recognizes this as error-handling middleware specifically
// because it takes FOUR arguments (err, req, res, next) instead of three.
// It must be registered with app.use() AFTER every other route in index.js —
// Express only reaches it when something calls next(err), which asyncHandler
// does automatically whenever a wrapped route throws.
export function errorHandler(err, req, res, next) {
    console.error(err)

    const statusCode = err.statusCode || 500
    const message = err.statusCode
        ? err.message
        : "Something went wrong on our end"

    res.status(statusCode).json({ message })
}
