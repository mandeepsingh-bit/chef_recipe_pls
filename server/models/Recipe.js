import mongoose from "mongoose"

const recipeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    ingredients: {
        type: [String],
        required: true,
    },
    recipeMarkdown: {
        type: String,
        required: true,
    },
}, { timestamps: true })

export default mongoose.model("Recipe", recipeSchema)
