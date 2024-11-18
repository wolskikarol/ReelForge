import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

function Header() {
    const [isLoggedIn, user] = useAuthStore((state) => [state.isLoggedIn, state.user]);

    return (
        <header className="app-header">
            <nav className="navbar navbar-expand-lg custom-navbar">
                <div className="container">
                    <Link className="navbar-brand" to="/">
                        ReelForge
                    </Link>
                    <button
                        className="navbar-toggler ms-auto"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarCollapse"
                        aria-controls="navbarCollapse"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="h6 d-none d-sm-inline-block text-white">Menu</span>
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navbarCollapse">
                        <ul className="navbar-nav navbar-nav-scroll ms-auto">
                            <li className="nav-item dropdown">
                                <Link className="nav-link active" to="/">
                                    Home
                                </Link>
                            </li>

                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle active"
                                    href="#"
                                    id="pagesMenu"
                                    data-bs-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                >
                                    Pages
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="pagesMenu">
                                    <li>
                                        <Link className="dropdown-item" to="/about/">
                                            <i className="bi bi-person-lines-fill"></i> About
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                            <li className="nav-item">
                                {isLoggedIn() ? (
                                    <>
                                        <Link to={"/Profile/"} className="btn custom-btn">
                                            Profile <i className="fas fa-user"></i>
                                        </Link>
                                        <Link to={"/logout/"} className="btn custom-btn ms-2">
                                            Logout <i className="fas fa-sign-in-alt"></i>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to={"/register/"} className="btn custom-btn">
                                            Register <i className="fas fa-user-plus"></i>
                                        </Link>
                                        <Link to={"/login/"} className="btn custom-btn ms-2">
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
