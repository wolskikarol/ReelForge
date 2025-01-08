import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import "./css/Scripts.css";

const Scripts = () => {
  const { projectid } = useParams();
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  useEffect(() => {
    fetchScripts(`http://localhost:8000/api/v1/project/${projectid}/scripts/`);
  }, [projectid]);

  const fetchScripts = async (url) => {
    try {
      const token = Cookies.get("access_token");
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setScripts(response.data.results);
      setNextPage(response.data.next);
      setPreviousPage(response.data.previous);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("Project or scripts not found.");
      } else {
        setError("An error occurred while fetching scripts.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScriptClick = (scriptId) => {
    navigate(`/project/${projectid}/scripts/${scriptId}`);
  };

  if (loading) return <p className="loading-message">Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="scripts-container">
      <h1>Scripts for Project {projectid}</h1>
      {scripts.length > 0 ? (
        <ul className="scripts-list">
          {scripts.map((script) => (
            <li key={script.id} onClick={() => handleScriptClick(script.id)}>
              <h2>{script.title}</h2>
              <small>
                Last modified:{" "}
                {new Date(script.updated_at).toLocaleDateString()}
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <p>No scripts found for this project.</p>
      )}
      <div className="pagination-buttons">
        {previousPage && (
          <button onClick={() => fetchScripts(previousPage)}>Previous</button>
        )}
        {nextPage && (
          <button onClick={() => fetchScripts(nextPage)}>Next</button>
        )}
      </div>
    </div>
  );
};

export default Scripts;
