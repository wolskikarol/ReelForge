import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import "./SidePanel.css"

const SidePanel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        const token = Cookies.get("access_token");
        if (!token) {
          setError("You must be logged in!");
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://127.0.0.1:8000/api/v1/project/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProjectName(response.data.title);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load project name.");
        setLoading(false);
      }
    };

    fetchProjectName();
  }, [id]);

  if (loading) {
    return <div className="sidepanel"><p>Loading project name...</p></div>;
  }

  if (error) {
    return <div className="sidepanel"><p>{error}</p></div>;
  }

  return (
    <aside className="sidepanel">
      <div className="sidepanel-header">
        <h2>{projectName}</h2>
      </div>
      <nav className="sidepanel-nav">
        <ul>
          <li><Link to={`/project/${id}/scripts`}>Scripts</Link></li>
          <li><Link to={`/project/${id}/shot-lists`}>Shot Lists</Link></li>
          <li><Link to={`/project/${id}/storyboards`}>Storyboards</Link></li>
          <li><Link to={`/project/${id}/schedule`}>Schedules</Link></li>
          <li><Link to={`/project/${id}/budget`}>Budget</Link></li>
          <li><Link to={`/project/${id}/tasks`}>Tasks</Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default SidePanel;
