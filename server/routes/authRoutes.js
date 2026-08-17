import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { AppError } from "../utils/AppError.js"

const router = express.Router()

function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

// Shared validation for both register and login — throwing here means
// asyncHandler catches it and forwards straight to errorHandler.js,
// so neither route needs its own try/catch for these checks.
function validateCredentials(username, password) {
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

router.post("/register", asyncHandler(async (req, res) => {
    const { username, password } = req.body
    validateCredentials(username, password)

    const existingUser = await User.findOne({ username })
    if (existingUser) {
        throw new AppError("That username is already taken", 409)
    }

    // Password gets hashed automatically by the pre-save hook on the User model
    const user = await User.create({ username, password })

    const token = generateToken(user._id)
    res.status(201).json({ token, username: user.username })
}))

router.post("/login", asyncHandler(async (req, res) => {
    const { username, password } = req.body
    validateCredentials(username, password)

    const user = await User.findOne({ username })
    if (!user) {
        throw new AppError("Invalid username or password", 401)
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
        throw new AppError("Invalid username or password", 401)
    }

    const token = generateToken(user._id)
    res.json({ token, username: user.username })
}))

export default router
