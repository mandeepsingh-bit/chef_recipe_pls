import React from "react"
import ReactMarkdown from "react-markdown"
import { fetchRecipeHistory, deleteRecipeFromHistory } from "../auth"

export default function History({ token, onBack }) {
    const [recipes, setRecipes] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState("")

    React.useEffect(() => {
        fetchRecipeHistory(token)
            .then(setRecipes)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [token])

    async function handleDelete(recipeId) {
        try {
            await deleteRecipeFromHistory(token, recipeId)
            setRecipes((prev) => prev.filter((r) => r._id !== recipeId))
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <main>
            <button className="link-btn" onClick={onBack}>&larr; Back</button>
            <h2>Your recipe history</h2>

            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && recipes.length === 0 && <p>No saved recipes yet.</p>}

            {recipes.map((r) => (
                <section key={r._id} className="history-item">
                    <div className="history-item-header">
                        <p className="history-ingredients">
                            <strong>Ingredients:</strong> {r.ingredients.join(", ")}
                        </p>
                        <button
                            className="remove-btn"
                            onClick={() => handleDelete(r._id)}
                        >
                            Delete
                        </button>
                    </div>
                    <ReactMarkdown>{r.recipeMarkdown}</ReactMarkdown>
                </section>
            ))}
        </main>
    )
}
