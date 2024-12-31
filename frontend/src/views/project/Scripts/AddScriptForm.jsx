import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import "./css/AddScriptForm.css";

const AddScriptForm = ({ onScriptAdded, onClose }) => {
  const { projectid } = useParams();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = Cookies.get("access_token");
      await axios.post(
        `http://localhost:8000/api/v1/project/${projectid}/scripts/`,
        { title },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      onScriptAdded();
      setTitle("");
      setSuccess("Script added successfully!");
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create script.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-script-container">
      <button className="close-modal-btn" onClick={onClose}>
        X
      </button>
      <h2>Add New Script</h2>
      {error && <p className="add-script-message error">{error}</p>}
      {success && <p className="add-script-message success">{success}</p>}
      <form className="add-script-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="script-title">Title</label>
          <input
            id="script-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter script title"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Script"}
        </button>
      </form>
    </div>
  );
};

export default AddScriptForm;
