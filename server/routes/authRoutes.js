import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { AppError } from "../utils/AppError.js"
import { validateCredentials } from "../utils/validateCredentials.js"
import rateLimit from "express-rate-limit"




const router = express.Router()

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per IP in that window
    message: { message: "Too many login attempts. Please try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
})


function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

// Shared validation for both register and login — throwing here means
// asyncHandler catches it and forwards straight to errorHandler.js,
// so neither route needs its own try/catch for these checks.
  

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

router.post("/login",loginLimiter, asyncHandler(async (req, res) => {
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
