import express from "express"
import Recipe from "../models/Recipe.js"
import { verifyToken } from "../middleware/verifyToken.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { AppError } from "../utils/AppError.js"

const router = express.Router()

// Every route below runs verifyToken first — req.userId is only
// available because that middleware set it after checking the JWT.
router.use(verifyToken)

router.post("/", asyncHandler(async (req, res) => {
    const { ingredients, recipeMarkdown } = req.body

    if (!ingredients || !ingredients.length || !recipeMarkdown) {
        throw new AppError("Ingredients and a recipe are required", 400)
    }

    const recipe = await Recipe.create({
        user: req.userId,
        ingredients,
        recipeMarkdown,
    })

    res.status(201).json(recipe)
}))

router.get("/", asyncHandler(async (req, res) => {
    const recipes = await Recipe.find({ user: req.userId }).sort({ createdAt: -1 })
    res.json(recipes)
}))

router.delete("/:id", asyncHandler(async (req, res) => {
    // Scoping the query to BOTH _id and user means a user can never
    // delete someone else's recipe, even if they guessed a valid ID.
    const recipe = await Recipe.findOneAndDelete({
        _id: req.params.id,
        user: req.userId,
    })

    if (!recipe) {
        throw new AppError("Recipe not found", 404)
    }

    res.json({ message: "Recipe deleted" })
}))

export default router
