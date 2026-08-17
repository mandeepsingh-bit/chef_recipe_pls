import React from "react"
import Header from "./Header"
import Main from "./Main"
import AuthForm from "./components/AuthForm"
import History from "./components/History"

export default function App() {
    const [token, setToken] = React.useState(() => localStorage.getItem("token"))
    const [username, setUsername] = React.useState(() => localStorage.getItem("username"))
    const [view, setView] = React.useState("main") // "main" | "login" | "history"

    function handleAuthSuccess(newToken, newUsername) {
        localStorage.setItem("token", newToken)
        localStorage.setItem("username", newUsername)
        setToken(newToken)
        setUsername(newUsername)
        setView("main")
    }

    function handleLogout() {
        localStorage.removeItem("token")
        localStorage.removeItem("username")
        setToken(null)
        setUsername(null)
        setView("main")
    }

    return (
        <>
            <Header
                username={username}
                onLogin={() => setView("login")}
                onLogout={handleLogout}
                onShowHistory={() => setView("history")}
            />

            {view === "login" && (
                <AuthForm
                    onAuthSuccess={handleAuthSuccess}
                    onCancel={() => setView("main")}
                />
            )}

            {view === "history" && token && (
                <History token={token} onBack={() => setView("main")} />
            )}

            {view === "main" && <Main token={token} />}
        </>
    )
}
