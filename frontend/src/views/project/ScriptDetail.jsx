import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie"


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
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : script ? (
        <div>
          <h2>{script.title}</h2>
          <p>{script.content}</p>
        </div>
      ) : (
        <p>Could not load script details.</p>
      )}
    </div>
  );
};

export default ScriptDetail;
