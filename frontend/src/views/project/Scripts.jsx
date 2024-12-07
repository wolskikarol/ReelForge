import React, { useEffect, useState} from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Cookies from 'js-cookie'
import useUserData from '../../plugin/useUserData'
import Header from '../partials/Header'
import Footer from '../partials/Footer'
import SidePanel from '../partials/SidePanel'
import "./css/Scripts.css"


const Scripts = () => {
  const { projectid } = useParams();
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // For pagination
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
          setScripts(response.data.results); // Użycie `results` do ustawienia danych
          setNextPage(response.data.next); // Zapisz URL kolejnej strony
          setPreviousPage(response.data.previous); // Zapisz URL poprzedniej strony
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
    navigate(`/project/${projectid}/scripts/${scriptId}`); // Przejście do strony skryptu
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
      <div>
          <h1>Scripts for Project {projectid}</h1>
          {scripts.length > 0 ? (
              <ul>
                  {scripts.map((script) => (
                      <li key={script.id}
                      style={{ cursor: "pointer", color: "blue" }}
                      onClick={() => handleScriptClick(script.id)} // Kliknięcie na scenariusz
                      >
                          <h2>{script.title}</h2>
                          <p>{script.content.slice(0, 50)}...</p>
                          <small>
                              Last modified:{" "}
                              {new Date(script.last_modified).toLocaleDateString()}
                          </small>
                      </li>
                  ))}
              </ul>
          ) : (
              <p>No scripts found for this project.</p>
          )}
          <div>
              {/* Buttons for pagination */}
              {previousPage && (
                  <button onClick={() => fetchScripts(previousPage)}>Previous</button>
              )}
              {nextPage && <button onClick={() => fetchScripts(nextPage)}>Next</button>}
          </div>
      </div>
  );
};

export default Scripts