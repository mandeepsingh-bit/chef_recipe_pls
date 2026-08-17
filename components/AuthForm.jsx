import React from "react"
import { loginUser, registerUser } from "../auth"

export default function AuthForm({ onAuthSuccess, onCancel }) {
    const [isRegistering, setIsRegistering] = React.useState(false)
    const [username, setUsername] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [error, setError] = React.useState("")
    const [loading, setLoading] = React.useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const data = isRegistering
                ? await registerUser(username, password)
                : await loginUser(username, password)

            onAuthSuccess(data.token, data.username)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-overlay">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>{isRegistering ? "Create an account" : "Log in"}</h2>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && <p className="error-message">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Please wait..." : isRegistering ? "Sign up" : "Log in"}
                </button>

                <p className="auth-toggle">
                    {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        type="button"
                        className="link-btn"
                        onClick={() => setIsRegistering(!isRegistering)}
                    >
                        {isRegistering ? "Log in" : "Sign up"}
                    </button>
                </p>

                <button type="button" className="link-btn" onClick={onCancel}>
                    Cancel
                </button>
            </form>
        </div>
    )
}
