import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie"
import ScriptEditor from "./ScriptEditor";
import Header from "../../partials/Header";
import Footer from "../../partials/Footer";
import SidePanel from "../../partials/SidePanel";



const ScriptDetail = () => {
  const { projectid, scriptid } = useParams();
  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScript = async () => {
      try {
        const token = Cookies.get("access_token");
        const response = await axios.get(
          `http://localhost:8000/api/v1/project/${projectid}/scripts/${scriptid}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setScript(response.data);
      } catch (error) {
        console.error("Failed to fetch script details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScript();
  }, [projectid, scriptid]);

  return (
    <div className='app-container'>
    <Header />
    <div className="content-container">
    <SidePanel />
    <div className="main-content">
      {loading ? (
        <p>Loading...</p>
      ) : script ? (
        <div>
          <h2>{script.title}</h2>
          <ScriptEditor/>
        </div>
      ) : (
        <p>Could not load script details.</p>
      )}
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default ScriptDetail;
