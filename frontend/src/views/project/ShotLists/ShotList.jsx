import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import Modal from "react-modal";
import Header from "../../partials/Header";
import Footer from "../../partials/Footer";
import SidePanel from "../../partials/SidePanel";
import "./css/ShotList.css";

Modal.setAppElement("#root");

const ShotList = () => {
  const { projectid } = useParams();
  const [shots, setShots] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchShots(pagination.currentPage);
  }, [projectid, pagination.currentPage]);

  const fetchShots = (page) => {
    axios
      .get(`http://localhost:8000/api/v1/project/${projectid}/shots/`, {
        params: { page },
        headers: {
          Authorization: `Bearer ${Cookies.get("access_token")}`,
        },
      })
      .then((response) => {
        setShots(response.data.results || []);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(response.data.count / 10),
        });
      })
      .catch((error) => {
        console.error("Error fetching shots:", error);
      });
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  };

  const handlePreviousPage = () => {
    if (pagination.currentPage > 1) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };
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
        setIsAddModalOpen(false);
      })
      .catch((error) => {
        console.error("Error adding shot:", error);
      });
  };

  const handleEditShot = (shot) => {
    setEditingShot({ ...shot });
    setIsEditModalOpen(true);
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
        setIsEditModalOpen(false);
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
    <div className="app-container">
      <Header />
      <div className="content-container">
        <SidePanel />
        <div className="main-content">
          <h2 className="shot-list-header">Shot List</h2>
          {shots.length > 0 ? (
            <ul className="shot-list">
              {shots.map((shot) => (
                <li className="shot-list-item" key={shot.id}>
                  <strong>{shot.title}</strong>
                  Scene: {shot.scene_number}, Shot: {shot.shot_number} -{" "}
                  {shot.description} - {shot.shot_type} ({shot.duration}),{" "}
                  {shot.equipment}, {shot.movement}
                  <div className="shot-actions">
                    <button onClick={() => handleEditShot(shot)}>Edit</button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteShot(shot.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No shots in this project.</p>
          )}

          <div className="pagination-controls">
            <button
              disabled={pagination.currentPage === 1}
              onClick={handlePreviousPage}
            >
              Previous
            </button>
            <span>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={handleNextPage}
            >
              Next
            </button>
          </div>
          <button
            className="add-shot-button"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add New Shot
          </button>
        </div>
      </div>
      <Footer />

      {/* Modal for Adding a Shot */}
      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
        contentLabel="Add New Shot"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h3>Add Shot</h3>
        <input
          type="text"
          placeholder="Title"
          value={newShot.title}
          onChange={(e) => setNewShot({ ...newShot, title: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={newShot.description}
          onChange={(e) =>
            setNewShot({ ...newShot, description: e.target.value })
          }
        ></textarea>
        <input
          type="text"
          placeholder="Shot Type"
          value={newShot.shot_type}
          onChange={(e) =>
            setNewShot({ ...newShot, shot_type: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Duration (e.g., 00:01:30)"
          value={newShot.duration}
          onChange={(e) => setNewShot({ ...newShot, duration: e.target.value })}
        />
        <input
          type="number"
          placeholder="Scene Number"
          value={newShot.scene_number}
          onChange={(e) =>
            setNewShot({ ...newShot, scene_number: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Shot Number"
          value={newShot.shot_number}
          onChange={(e) =>
            setNewShot({ ...newShot, shot_number: e.target.value })
          }
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
          onChange={(e) => setNewShot({ ...newShot, movement: e.target.value })}
        ></textarea>
        <button onClick={handleAddShot}>Add</button>
        <button onClick={() => setIsAddModalOpen(false)}>Cancel</button>
      </Modal>

      {/* Modal for Editing a Shot */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        contentLabel="Edit Shot"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h3>Edit Shot</h3>
        {editingShot && (
          <>
            <input
              type="text"
              placeholder="Title"
              value={editingShot.title}
              onChange={(e) =>
                setEditingShot({ ...editingShot, title: e.target.value })
              }
            />
            <textarea
              placeholder="Description"
              value={editingShot.description}
              onChange={(e) =>
                setEditingShot({ ...editingShot, description: e.target.value })
              }
            ></textarea>
            <input
              type="text"
              placeholder="Shot Type"
              value={editingShot.shot_type}
              onChange={(e) =>
                setEditingShot({ ...editingShot, shot_type: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Duration (e.g., 00:01:30)"
              value={editingShot.duration}
              onChange={(e) =>
                setEditingShot({ ...editingShot, duration: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Scene Number"
              value={editingShot.scene_number}
              onChange={(e) =>
                setEditingShot({ ...editingShot, scene_number: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Shot Number"
              value={editingShot.shot_number}
              onChange={(e) =>
                setEditingShot({ ...editingShot, shot_number: e.target.value })
              }
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
            <button onClick={handleUpdateShot}>Save</button>
            <button onClick={() => setIsEditModalOpen(false)}>Cancel</button>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ShotList;
