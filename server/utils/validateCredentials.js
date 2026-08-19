import { AppError } from "./AppError.js"

export function validateCredentials(username, password) {
    if (!username || !password) {
        throw new AppError("Username and password are required", 400)
    }
    if (username.trim().length < 3) {
        throw new AppError("Username must be at least 3 characters", 400)
    }
    if (password.length < 6) {
        throw new AppError("Password must be at least 6 characters", 400)
    }
}