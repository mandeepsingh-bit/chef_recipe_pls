import React from "react"

export default function AccountMenu({ username, onLogin, onLogout, onShowHistory }) {
    const [open, setOpen] = React.useState(false)

    if (!username) {
        return (
            <button className="account-btn" onClick={onLogin}>
                Log in
            </button>
        )
    }

    return (
        <div className="account-menu">
            <button className="account-btn" onClick={() => setOpen(!open)}>
                👤 {username}
            </button>
            {open && (
                <div className="account-dropdown">
                    <button onClick={() => { setOpen(false); onShowHistory() }}>
                        My recipe history
                    </button>
                    <button onClick={() => { setOpen(false); onLogout() }}>
                        Log out
                    </button>
                </div>
            )}
        </div>
    )
}
