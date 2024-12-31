import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

function Header() {
    const [isLoggedIn, user] = useAuthStore((state) => [state.isLoggedIn, state.user]);

    return (
        <header className="app-header" style={{ backgroundColor: "#181a1d", color: "var(--color-neutral)" }}>
            <nav className="navbar navbar-expand-lg custom-navbar">
                <div className="container">
                    <Link className="navbar-brand" to="/" style={{ color: "var(--color-accent)" }}>
                        ReelForge
                    </Link>

                    <div className="collapse navbar-collapse" id="navbarCollapse" >
                        <ul className="navbar-nav navbar-nav-scroll ms-auto" style={{backgroundColor: "transparent"}}>
                            <li className="nav-item dropdown" style={{backgroundColor: "transparent"}}>
                                <Link className="nav-link active" to="/" style={{ color: "var(--color-accent)",backgroundColor: "transparent", border: "2px solid var(--color-accent)", padding: "5px 10px", borderRadius: "5px" }}>
                                    Home
                                </Link>
                            </li>
                            <li className="nav-item" style={{backgroundColor: "transparent"}}>
                                {isLoggedIn() ? (
                                    <>
                                        <Link
                                            to="/profile/"
                                            className="btn custom-btn"
                                            style={{ backgroundColor: "transparent", color: "var(--color-accent)", border: "2px solid var(--color-accent)", boxShadow: "none", padding: "5px 10px", borderRadius: "5px" }}
                                        >
                                            Profile <i className="fas fa-user"></i>
                                        </Link>
                                        <Link
                                            to="/logout/"
                                            className="btn custom-btn ms-2"
                                            style={{ backgroundColor: "transparent", color: "var(--color-highlight)", border: "2px solid var(--color-highlight)", boxShadow: "none", padding: "5px 10px", borderRadius: "5px" }}
                                        >
                                            Logout <i className="fas fa-sign-in-alt"></i>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/register/"
                                            className="btn custom-btn"
                                            style={{ backgroundColor: "transparent", color: "var(--color-accent)", border: "2px solid var(--color-accent)", boxShadow: "none", padding: "5px 10px", borderRadius: "5px" }}
                                        >
                                            Register <i className="fas fa-user-plus"></i>
                                        </Link>
                                        <Link
                                            to="/login/"
                                            className="btn custom-btn ms-2"
                                            style={{ backgroundColor: "transparent", color: "var(--color-highlight)", border: "2px solid var(--color-highlight)", boxShadow: "none", padding: "5px 10px", borderRadius: "5px" }}
                                        >
                                            Login <i className="fas fa-sign-in-alt"></i>
                                        </Link>
                                    </>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;
