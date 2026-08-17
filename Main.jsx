import React from "react"
import IngredientsList from "./components/IngredientsList"
import ClaudeRecipe from "./components/ClaudeRecipe"
import { getRecipeFromChefClaude } from "./ai"
import { saveRecipeToHistory } from "./auth"

export default function Main({ token }) {
    const [ingredients, setIngredients] = React.useState(
        []
    )
    const [recipe, setRecipe] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState("")

    async function getRecipe() {
        setLoading(true)
        setError("")
        try {
            const recipeMarkdown = await getRecipeFromChefClaude(ingredients)
            setRecipe(recipeMarkdown)

            // Only logged-in users have a token, so this silently
            // does nothing for guests browsing without an account.
            if (token) {
                saveRecipeToHistory(token, ingredients, recipeMarkdown).catch(() => {
                    // Saving to history failing shouldn't block showing the recipe
                    console.error("Could not save this recipe to history")
                })
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        if (recipe !== "") {
            document.querySelector(".suggested-recipe-container")
                ?.scrollIntoView({ behavior: "smooth" })
        }
    }, [recipe])

    function addIngredient(formData) {
        const newIngredient = formData.get("ingredient").trim().toLowerCase()

        if (newIngredient === "" || ingredients.includes(newIngredient)) {
            return
        }

        setIngredients(prevIngredients => [...prevIngredients, newIngredient])
    }

    function deleteIngredient(indexToDelete) {
        setIngredients(prevIngredients =>
            prevIngredients.filter((ingredient, index) => index !== indexToDelete)
        )
    }

    return (
        <main>
            <form action={addIngredient} className="add-ingredient-form">
                <input
                    type="text"
                    placeholder="e.g. oregano"
                    aria-label="Add ingredient"
                    name="ingredient"
                />
                <button>Add ingredient</button>
            </form>

            {ingredients.length > 0 &&
                <IngredientsList
                    ingredients={ingredients}
                    getRecipe={getRecipe}
                    deleteIngredient={deleteIngredient}
                    loading={loading}
                />
            }

            {error && <p className="error-message">{error}</p>}

            {recipe && (
                <ClaudeRecipe recipe={recipe} getRecipe={getRecipe} loading={loading} />
            )}
        </main>
    )
}
