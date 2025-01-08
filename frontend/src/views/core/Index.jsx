import React from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link } from "react-router-dom";
import ProjectList from "./ProjectList";
import "./css/Index.css";

function Index() {
  return (
    <div className="app">
      <Header />
      <div className="hero">
        <h1 className="hero-title">Welcome to ReelForge</h1>
        <p className="hero-description">
          Organize, create, and manage your film projects with ease.
        </p>
        <Link className="hero-button" to={"/project/create/"}>
          Create New Project
        </Link>
      </div>
      <div className="app-content">
        <h2 className="section-title">Your Projects</h2>
        <ProjectList />
      </div>
      <Footer />
    </div>
  );
}

export default Index;
