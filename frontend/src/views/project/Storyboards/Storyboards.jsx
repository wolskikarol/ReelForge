import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import Modal from "react-modal";
import "react-medium-image-zoom/dist/styles.css";
import Zoom from "react-medium-image-zoom";
import Header from "../../partials/Header";
import Footer from "../../partials/Footer";
import SidePanel from "../../partials/SidePanel"
import "./css/Storyboards.css"

Modal.setAppElement("#root");

const Storyboards = () => {
  const { projectid } = useParams();
  const [storyboards, setStoryboards] = useState([]);
  const [selectedStoryboard, setSelectedStoryboard] = useState(null);
  const [newStoryboard, setNewStoryboard] = useState({
    title: "",
    description: "",
    image: null,
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formModalIsOpen, setFormModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/v1/project/${projectid}/storyboards/`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("access_token")}`,
        },
      })
      .then((response) => {
        setStoryboards(response.data.results || []);
      })
      .catch((error) => console.error("Error fetching storyboards:", error));
  }, [projectid]);

  const handleFileChange = (e) => {
    setNewStoryboard({ ...newStoryboard, image: e.target.files[0] });
  };

  const handleAddStoryboard = () => {
    const formData = new FormData();
    formData.append("title", newStoryboard.title);
    formData.append("description", newStoryboard.description);
    formData.append("project", projectid);
    if (newStoryboard.image) {
      formData.append("image", newStoryboard.image);
    }
    axios
      .post(
        `http://localhost:8000/api/v1/project/${projectid}/storyboards/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        setStoryboards((prev) => [...prev, response.data]);
        setNewStoryboard({
          title: "",
          description: "",
          image: null,
        });
        setFormModalIsOpen(false);
      })
      .catch((error) => {
        console.error("Error adding storyboard:", error);
      });
  };

  const handleEditStoryboard = () => {
    const formData = new FormData();
    formData.append("title", newStoryboard.title);
    formData.append("description", newStoryboard.description);
  
    if (newStoryboard.image) {
      formData.append("image", newStoryboard.image);
    }
  
    axios
      .patch(
        `http://localhost:8000/api/v1/project/${projectid}/storyboards/${selectedStoryboard.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        setStoryboards((prev) =>
          prev.map((storyboard) =>
            storyboard.id === selectedStoryboard.id ? response.data : storyboard
          )
        );
  
        setSelectedStoryboard(response.data);
  
        setFormModalIsOpen(false);
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Error editing storyboard:", error.response?.data || error);
      });
  };
  
  
  const handleDeleteStoryboard = (id) => {
    axios
      .delete(`http://localhost:8000/api/v1/project/${projectid}/storyboards/${id}/`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("access_token")}`,
        },
      })
      .then(() => {
        setStoryboards((prev) => prev.filter((storyboard) => storyboard.id !== id));
        setModalIsOpen(false);
      })
      .catch((error) => {
        console.error("Error deleting storyboard:", error);
      });
  };

  return (

    <div className='app-container'>
    <Header />
    <div className="content-container">
        <SidePanel />
        <div className="main-content">

        <h2 className="storyboards-header">Storyboards</h2>
          <div className="storyboards-grid">
            {storyboards.map((storyboard) => (
              <div
                className="storyboard-card"
                key={storyboard.id}
                onClick={() => {
                  setSelectedStoryboard(storyboard);
                  setModalIsOpen(true);
                }}
              >
                {storyboard.image ? (
  <img
    src={storyboard.image}
    alt={storyboard.title}
    className="storyboard-image"
  />
) : (
  <div className="storyboard-placeholder">
    <span>No Image Available</span>
  </div>
)}
                <h4>{storyboard.title}</h4>
              </div>
            ))}
          </div>
          <button
            className="add-storyboard-button"
            onClick={() => {
              setNewStoryboard({
                title: "",
                description: "",
                image: null,
              });
              setIsEditing(false);
              setFormModalIsOpen(true);
            }}
          >
            Add Storyboard
          </button>

      {modalIsOpen && selectedStoryboard && (
        <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        overlayClassName="ReactModal__Overlay"
        className="ReactModal__Content"
      >
        <button
          onClick={() => setModalIsOpen(false)}
          style={{ float: "right", marginBottom: "10px" }}
        >
          Close
        </button>
        <h3>{selectedStoryboard?.title}</h3>
        <Zoom>
          <img
            src={selectedStoryboard?.image}
            alt={selectedStoryboard?.title}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
          />
        </Zoom>
        <p>{selectedStoryboard?.description}</p>
        <p>
          <strong>Created at:</strong>{" "}
          {new Date(selectedStoryboard?.created_at).toLocaleString()}
        </p>
        <p>
          <strong>Updated at:</strong>{" "}
          {new Date(selectedStoryboard?.updated_at).toLocaleString()}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={() => {
              setNewStoryboard({
                title: selectedStoryboard.title,
                description: selectedStoryboard.description,
                image: null,
              });
              setIsEditing(true);
              setFormModalIsOpen(true);
            }}
          >
            Edit
          </button>
          <button
            className="delete-button"
            onClick={() => handleDeleteStoryboard(selectedStoryboard.id)}
          >
            Delete
          </button>
        </div>
      </Modal>
      
      )}

      {formModalIsOpen && (
        <Modal
  isOpen={formModalIsOpen}
  onRequestClose={() => setFormModalIsOpen(false)}
  overlayClassName="ReactModal__Overlay"
  className="ReactModal__Content"
>
  <button
    onClick={() => setFormModalIsOpen(false)}
    style={{ float: "right", marginBottom: "10px" }}
  >
    Close
  </button>
  <h3 style={{ marginBottom: "20px" }}>
    {isEditing ? "Edit Storyboard" : "Add Storyboard"}
  </h3>
  <form
    onSubmit={(e) => {
      e.preventDefault();
      isEditing ? handleEditStoryboard() : handleAddStoryboard();
    }}
  >
    <div style={{ marginBottom: "15px" }}>
      <label htmlFor="title" style={{ display: "block", marginBottom: "5px" }}>
        Title
      </label>
      <input
        id="title"
        type="text"
        placeholder="Enter storyboard title"
        value={newStoryboard.title}
        onChange={(e) =>
          setNewStoryboard({ ...newStoryboard, title: e.target.value })
        }
        style={{
          width: "100%",
          padding: "10px",
          border: "1px solid var(--color-accent)",
          borderRadius: "5px",
        }}
        required
      />
    </div>
    <div style={{ marginBottom: "15px" }}>
      <label
        htmlFor="description"
        style={{ display: "block", marginBottom: "5px" }}
      >
        Description
      </label>
      <textarea
        id="description"
        placeholder="Enter storyboard description"
        value={newStoryboard.description}
        onChange={(e) =>
          setNewStoryboard({ ...newStoryboard, description: e.target.value })
        }
        style={{
          width: "100%",
          padding: "10px",
          border: "1px solid var(--color-accent)",
          borderRadius: "5px",
          minHeight: "100px",
        }}
      />
    </div>
    <div style={{ marginBottom: "15px" }}>
      <label htmlFor="image" style={{ display: "block", marginBottom: "5px" }}>
        Image
      </label>
      <input
        id="image"
        type="file"
        onChange={handleFileChange}
        style={{
          padding: "5px",
          border: "1px solid var(--color-accent)",
          borderRadius: "5px",
          backgroundColor: "#e1d5c9",
        }}
      />
    </div>
    <button
      type="submit"
      style={{
        backgroundColor: "#c29450",
        color: "#f5f1e3",
        padding: "10px 15px",
        borderRadius: "5px",
        border: "none",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
      }}
    >
      {isEditing ? "Save Changes" : "Add Storyboard"}
    </button>
  </form>
</Modal>

      )}
        </div>
    </div>
    <Footer />
</div>

  );
};

export default Storyboards;
