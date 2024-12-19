import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import Header from "../../partials/Header";
import Footer from "../../partials/Footer";
import SidePanel from "../../partials/SidePanel";

const ShotList = () => {
  const { projectid } = useParams();
  const [shots, setShots] = useState([]);
  const [newShot, setNewShot] = useState({
    title: "",
    description: "",
    shot_type: "",
    duration: "",
    scene_number: "",
    shot_number: "",
    equipment: "",
    movement: "",
    project: projectid,
  });
  const [editingShot, setEditingShot] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/v1/project/${projectid}/shots/`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("access_token")}`,
        },
      })
      .then((response) => {
        setShots(response.data.results || []);
      })
      .catch((error) => {
        console.error("Error fetching shots:", error);
      });
  }, [projectid]);

  const handleAddShot = () => {
    axios
      .post(
        `http://localhost:8000/api/v1/project/${projectid}/shots/`,
        newShot,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setShots((prevShots) => [...prevShots, response.data]);
        setNewShot({
          title: "",
          description: "",
          shot_type: "",
          duration: "",
          scene_number: "",
          shot_number: "",
          equipment: "",
          movement: "",
          project: projectid,
        });
      })
      .catch((error) => {
        console.error("Error adding shot:", error);
      });
  };

  const handleEditShot = (shot) => {
    setEditingShot({ ...shot });
  };

  const handleUpdateShot = () => {
    axios
      .put(
        `http://localhost:8000/api/v1/project/${projectid}/shots/${editingShot.id}/`,
        editingShot,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setShots((prevShots) =>
          prevShots.map((shot) =>
            shot.id === editingShot.id ? response.data : shot
          )
        );
        setEditingShot(null);
      })
      .catch((error) => {
        console.error("Error updating shot:", error);
      });
  };

  const handleDeleteShot = (id) => {
    axios
      .delete(
        `http://localhost:8000/api/v1/project/${projectid}/shots/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
          },
        }
      )
      .then(() => {
        setShots((prevShots) => prevShots.filter((shot) => shot.id !== id));
      })
      .catch((error) => {
        console.error("Error deleting shot:", error);
      });
  };

  return (
<div className='app-container'>
    <Header />
    <div className="content-container">
        <SidePanel />
        <div className="main-content">
          <h2>Shot List</h2>
      {shots.length > 0 ? (
        <ul>
          {shots.map((shot) => (
            <li key={shot.id}>
              <strong>{shot.title}</strong> Scene: {shot.scene_number}, Shot: {shot.shot_number} - {shot.description} - {shot.shot_type} ({shot.duration}), {shot.equipment}, {shot.movement} 
              <button onClick={() => handleEditShot(shot)}>Edit</button>
              <button onClick={() => handleDeleteShot(shot.id)}>Delete</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No shots in this project.</p>
      )}
      {editingShot ? (
        <div>
          <h3>Edit Shot</h3>
          <input
            type="text"
            placeholder="Title"
            value={editingShot.title}
            onChange={(e) =>
              setEditingShot({ ...editingShot, title: e.target.value })
            }
          />
          <input 
          type="number" 
          placeholder="Scene number" 
          value={editingShot.scene_number} 
          onChange={(e) => 
            setEditingShot({ ...editingShot, scene_number: e.target.value })
          } 
          required 
          />
          <input 
          type="number" 
          placeholder="Shot number" 
          value={editingShot.shot_number} 
          onChange={(e) => 
            setEditingShot({ ...editingShot, shot_number: e.target.value })
          } 
          required 
          />
          <textarea 
          placeholder="Equipment" 
          value={editingShot.equipment} 
          onChange={(e) =>
            setEditingShot({ ...editingShot, equipment: e.target.value })
          }
          ></textarea>
          <textarea 
          placeholder="Movement" 
          value={editingShot.movement} 
          onChange={(e) =>
            setEditingShot({ ...editingShot, movement: e.target.value })
          }
          ></textarea>
          <input
            type="text"
            placeholder="Shot type"
            value={editingShot.shot_type}
            onChange={(e) =>
              setEditingShot({ ...editingShot, shot_type: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Duration (for example: 00:01:30)"
            value={editingShot.duration}
            onChange={(e) =>
              setEditingShot({ ...editingShot, duration: e.target.value })
            }
          />
          <textarea
            placeholder="Description"
            value={editingShot.description}
            onChange={(e) =>
              setEditingShot({ ...editingShot, description: e.target.value })
            }
          />
          <button onClick={handleUpdateShot}>Save</button>
          <button onClick={() => setEditingShot(null)}>Cancel</button>
        </div>
      ) : (
        <div>
          <h3>Add Shot</h3>
          <input
            type="text"
            placeholder="Title"
            value={newShot.title}
            onChange={(e) =>
              setNewShot({ ...newShot, title: e.target.value })
            }
          />
          <input 
          type="number" 
          placeholder="Scene number" 
          value={newShot.scene_number} 
          onChange={(e) => 
            setNewShot({ ...newShot, scene_number: e.target.value })
          } 
          required 
          />
          <input 
          type="number" 
          placeholder="Shot number" 
          value={newShot.shot_number} 
          onChange={(e) => 
            setNewShot({ ...newShot, shot_number: e.target.value })
          } 
          required 
          />
          <textarea 
          placeholder="Equipment" 
          value={newShot.equipment} 
          onChange={(e) =>
           setNewShot({ ...newShot, equipment: e.target.value })
          }
          ></textarea>
          <textarea 
          placeholder="Movement" 
          value={newShot.movement} 
          onChange={(e) =>
           setNewShot({ ...newShot, movement: e.target.value })
          }
          ></textarea>
          <input
            type="text"
            placeholder="Shot type"
            value={newShot.shot_type}
            onChange={(e) =>
              setNewShot({ ...newShot, shot_type: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Duration (for example: 00:01:30)"
            value={newShot.duration}
            onChange={(e) =>
              setNewShot({ ...newShot, duration: e.target.value })
            }
          />
          <textarea
            placeholder="Description"
            value={newShot.description}
            onChange={(e) =>
              setNewShot({ ...newShot, description: e.target.value })
            }
          />
          <button onClick={handleAddShot}>Add</button>
        </div>
      )}
        </div>
    </div>
    <Footer />
</div>
  );
};

export default ShotList;
