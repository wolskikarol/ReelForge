import React, { useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { login } from "../../utils/auth";
import "./css/Login.css";

function Login() {
  const [bioData, setBioData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const validateFields = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!bioData.email) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(bioData.email)) {
      errors.email = "Invalid email format.";
    }

    if (!bioData.password) {
      errors.password = "Password is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (event) => {
    setBioData({
      ...bioData,
      [event.target.name]: event.target.value,
    });
    setFieldErrors({ ...fieldErrors, [event.target.name]: "" });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const { error } = await login(bioData.email, bioData.password);
    if (error) {
      setErrorMessage("Invalid email or password. Please try again.");
    } else {
      navigate("/");
    }

    setIsLoading(false);
  };

  return (
    <>
      <Header />
      <main className="login-container">
        <div className="login-card">
          <h1>Sign In</h1>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <form onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                name="email"
                id="email"
                value={bioData.email}
                onChange={handleInputChange}
                placeholder="johndoe@gmail.com"
                className={fieldErrors.email ? "input-error" : ""}
                required
              />
              {fieldErrors.email && (
                <div className="field-error">{fieldErrors.email}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                value={bioData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={fieldErrors.password ? "input-error" : ""}
                required
              />
              {fieldErrors.password && (
                <div className="field-error">{fieldErrors.password}</div>
              )}
            </div>
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Sign In"}
            </button>
          </form>
          <p className="signup-link">
            Don’t have an account? <Link to="/register/">Sign up</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Login;
