import React, { useEffect } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link } from "react-router-dom";
import { logout } from "../../utils/auth";
import "./css/Logout.css";

function Logout() {
  useEffect(() => {
    logout();
  }, []);

  return (
    <>
      <Header />
      <main className="logout-container">
        <div className="logout-card">
          <h1>You have been logged out</h1>
          <p>Thanks for visiting us, come back anytime!</p>
          <div className="logout-actions">
            <Link to="/login/" className="btn-primary">
              Login <i className="fas fa-sign-in-alt"></i>
            </Link>
            <Link to="/register/" className="btn-primary">
              Register <i className="fas fa-user-plus"></i>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Logout;
