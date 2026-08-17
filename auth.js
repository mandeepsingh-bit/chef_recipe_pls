const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"

export async function registerUser(username, password) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Registration failed")
    return data
}

export async function loginUser(username, password) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Login failed")
    return data
}

export async function saveRecipeToHistory(token, ingredients, recipeMarkdown) {
    const res = await fetch(`${API_BASE}/api/recipes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ingredients, recipeMarkdown }),
    })
    if (!res.ok) throw new Error("Couldn't save recipe to history")
    return res.json()
}

export async function fetchRecipeHistory(token) {
    const res = await fetch(`${API_BASE}/api/recipes`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error("Couldn't load your history")
    return res.json()
}

export async function deleteRecipeFromHistory(token, recipeId) {
    const res = await fetch(`${API_BASE}/api/recipes/${recipeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error("Couldn't delete this recipe")
    return res.json()
}
