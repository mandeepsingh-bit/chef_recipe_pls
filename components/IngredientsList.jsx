export default function IngredientsList(props) {
    const ingredientsListItems = props.ingredients.map((ingredient, index) => (
        <li key={index}>
            <div className="ingredient-row">
                <span>{ingredient}</span>
                <button
                    className="remove-btn"
                    onClick={() => props.deleteIngredient(index)}
                >
                    Remove
                </button>
            </div>
        </li>
    ))

    return (
        <section>
            <h2>Ingredients on hand:</h2>
            <ul className="ingredients-list" aria-live="polite">{ingredientsListItems}</ul>
            {props.ingredients.length > 3 && <div className="get-recipe-container">
                <div>
                    <h3>Ready for a recipe?</h3>
                    <p>Generate a recipe from your list of ingredients.</p>
                </div>
                <button onClick={props.getRecipe} disabled={props.loading}>
                    {props.loading ? "Thinking..." : "Get a recipe"}
                </button>
            </div>}
        </section>
    )
}
