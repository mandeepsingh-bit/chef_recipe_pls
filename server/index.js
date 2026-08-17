import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import recipeRoutes from "./routes/recipeRoutes.js"
import { errorHandler } from "./middleware/errorHandler.js"

dotenv.config()
connectDB()

const app = express()

// Only requests from this exact origin are allowed to call the API.
// Without this, app.use(cors()) would let ANY website's JS call your
// backend on behalf of a logged-in user — restricting origin is what
// stops that.
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/recipes", recipeRoutes)

app.get("/", (req, res) => {
    res.send("Chef Claude API is running")
})

// Must be registered AFTER all routes — Express walks middleware in
// order, and only routes an error-throwing request here once nothing
// earlier has already sent a response.
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
