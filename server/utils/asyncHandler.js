// Without this, every async route needs its own try/catch, or an error
// inside an async function silently becomes an unhandled promise rejection
// instead of reaching Express's error handling at all.
//
// This wraps a route function so that if it throws (or its returned
// promise rejects), the error is passed to next(err) automatically —
// which sends it straight to errorHandler.js below.
export function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}
