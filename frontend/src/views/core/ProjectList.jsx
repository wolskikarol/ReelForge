import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import "./css/ProjectList.css";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProjects = async (page = 1) => {
    try {
      setLoading(true);
      const token = Cookies.get("access_token");
      if (!token) {
        setError("Musisz być zalogowany.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `http://127.0.0.1:8000/api/v1/project/list/?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProjects(response.data.results || []);
      setTotalPages(Math.ceil(response.data.count / 10));
      setLoading(false);
    } catch (err) {
      setError("Nie udało się pobrać projektów.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage]);

  const truncateDescription = (description, maxLength = 100) => {
    if (!description) return "No description available.";
    return description.length > maxLength
      ? `${description.slice(0, maxLength)}...`
      : description;
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return <p className="loading">Loading Projects...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="project-list-container">
      <h1 className="project-list-title">Your Projects</h1>
      <div className="projects-grid">
        {Array.isArray(projects) && projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.id} className="project-card">
              <h2 className="project-title">{project.title}</h2>
              <p className="project-description">
                {truncateDescription(project.description, 100)}
              </p>
              <Link className="project-link" to={`/project/${project.id}`}>
                View Details
              </Link>
            </div>
          ))
        ) : (
          <p className="no-projects">No projects available.</p>
        )}
      </div>
      <div className="pagination-controls">
        <button
          className="pagination-button"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="pagination-button"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProjectList;
