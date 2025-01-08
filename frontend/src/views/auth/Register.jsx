import React, { useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../utils/auth";
import "./css/Register.css";

function Register() {
  const [bioData, setBioData] = useState({
    full_name: "",
    email: "",
    password: "",
    password2: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const validateFields = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!bioData.full_name) {
      errors.full_name = "Full name is required.";
    }
    if (!bioData.email) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(bioData.email)) {
      errors.email = "Invalid email format.";
    }
    if (!bioData.password) {
      errors.password = "Password is required.";
    }
    if (bioData.password !== bioData.password2) {
      errors.password2 = "Passwords do not match.";
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

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const { error } = await register(
      bioData.full_name,
      bioData.email,
      bioData.password,
      bioData.password2
    );
    if (error) {
      setErrorMessage("Registration failed. Please try again.");
    } else {
      navigate("/");
    }

    setIsLoading(false);
  };

  return (
    <>
      <Header />
      <main className="register-container">
        <div className="register-card">
          <h1>Sign Up</h1>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <form onSubmit={handleRegister} noValidate>
            <div className="form-group">
              <label htmlFor="full_name">Full Name</label>
              <input
                type="text"
                name="full_name"
                id="full_name"
                value={bioData.full_name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={fieldErrors.full_name ? "input-error" : ""}
                required
              />
              {fieldErrors.full_name && (
                <div className="field-error">{fieldErrors.full_name}</div>
              )}
            </div>
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
            <div className="form-group">
              <label htmlFor="password2">Confirm Password</label>
              <input
                type="password"
                name="password2"
                id="password2"
                value={bioData.password2}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={fieldErrors.password2 ? "input-error" : ""}
                required
              />
              {fieldErrors.password2 && (
                <div className="field-error">{fieldErrors.password2}</div>
              )}
            </div>
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Sign Up"}
            </button>
          </form>
          <p className="login-link">
            Already have an account? <Link to="/login/">Sign In</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Register;
