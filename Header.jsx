import chefClaudeLogo from "./images/chef-claude-icon.png"
import AccountMenu from "./components/AccountMenu"

export default function Header({ username, onLogin, onLogout, onShowHistory }) {
    return (
        <header>
            <div className="header-spacer" />
            <div className="header-center">
                <img src={chefClaudeLogo} alt="Chef Claude logo" />
                <h1>CHEF RECIPE PLS</h1>
            </div>
            <div className="header-account">
                <AccountMenu
                    username={username}
                    onLogin={onLogin}
                    onLogout={onLogout}
                    onShowHistory={onShowHistory}
                />
            </div>
        </header>
    )
}
