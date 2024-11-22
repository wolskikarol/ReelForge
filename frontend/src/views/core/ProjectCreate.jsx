import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Header from "../partials/Header";
import Footer from "../partials/Footer";

const ProjectCreate = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/v1/project/create/",
                { title, description },
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("access_token")}`,
                    },
                }
            );
            setSuccess("Project created successfully!");
            setTitle("");
            setDescription("");
        } catch (err) {
            setError(err.response?.data || "Something went wrong");
        }
    };

    return (
        <div className="app">
            <Header />
            <div className="app-content">
                <form onSubmit={handleSubmit}>
                    <label htmlFor="title">Project Title:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <label htmlFor="description">Project Description:</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                    <button type="submit">Create Project</button>
                </form>
                {success && <p style={{ color: "green" }}>{success}</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
            <Footer />
        </div>
    );
};

export default ProjectCreate;
