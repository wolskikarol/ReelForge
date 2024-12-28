import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import Modal from "react-modal";
import "react-medium-image-zoom/dist/styles.css";
import Zoom from "react-medium-image-zoom";

Modal.setAppElement("#root");

const Storyboards = () => {
  const { projectid } = useParams(); // Pobranie ID projektu z URL
  const [storyboards, setStoryboards] = useState([]); // Przechowywanie listy scenorysów
  const [selectedStoryboard, setSelectedStoryboard] = useState(null); // Wybrany scenorys do podglądu
  const [newStoryboard, setNewStoryboard] = useState({
    title: "",
    description: "",
    image: null,
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formModalIsOpen, setFormModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Pobieranie scenorysów z API
  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/v1/project/${projectid}/storyboards/`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("access_token")}`,
        },
      })
      .then((response) => {
        // Wyodrębnienie danych z "results"
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
    formData.append("image", newStoryboard.image);

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
  
    // Dodaj obraz tylko wtedy, gdy został wybrany
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
  
        // Ustaw zaktualizowany scenorys w modalnym oknie
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
    <div>
      <h2>Storyboards</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {storyboards.map((storyboard) => (
          <div
            key={storyboard.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              overflow: "hidden",
              cursor: "pointer",
            }}
            onClick={() => {
              setSelectedStoryboard(storyboard);
              setModalIsOpen(true);
            }}
          >
            <img
              src={storyboard.image}
              alt={storyboard.title}
              style={{ width: "100%", height: "150px", objectFit: "cover" }}
            />
            <h4 style={{ textAlign: "center", margin: "10px 0" }}>
              {storyboard.title}
            </h4>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          setNewStoryboard({
            title: "",
            description: "",
            image: null,
          });
          setIsEditing(false);
          setFormModalIsOpen(true);
        }}
        style={{ marginTop: "20px" }}
      >
        Add Storyboard
      </button>

      {modalIsOpen && selectedStoryboard && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          style={{
            content: {
              maxWidth: "600px",
              margin: "auto",
              borderRadius: "8px",
            },
          }}
        >
          <button onClick={() => setModalIsOpen(false)} style={{ float: "right" }}>
            Close
          </button>
          <h3>{selectedStoryboard.title}</h3>
          <Zoom>
            <img
              src={selectedStoryboard.image}
              alt={selectedStoryboard.title}
              style={{ width: "100%", height: "auto", borderRadius: "8px" }}
            />
          </Zoom>
          <p>{selectedStoryboard.description}</p>
          <p><strong>Created at:</strong> {new Date(selectedStoryboard.created_at).toLocaleString()}</p>
          <p><strong>Updated at:</strong> {new Date(selectedStoryboard.updated_at).toLocaleString()}</p>

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
            style={{ marginRight: "10px" }}
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteStoryboard(selectedStoryboard.id)}
            style={{ backgroundColor: "red", color: "white" }}
          >
            Delete
          </button>
        </Modal>
      )}

      {formModalIsOpen && (
        <Modal
          isOpen={formModalIsOpen}
          onRequestClose={() => setFormModalIsOpen(false)}
          style={{
            content: {
              maxWidth: "600px",
              margin: "auto",
              borderRadius: "8px",
            },
          }}
        >
          <button onClick={() => setFormModalIsOpen(false)} style={{ float: "right" }}>
            Close
          </button>
          <h3>{isEditing ? "Edit Storyboard" : "Add Storyboard"}</h3>
          <input
            type="text"
            placeholder="Title"
            value={newStoryboard.title}
            onChange={(e) =>
              setNewStoryboard({ ...newStoryboard, title: e.target.value })
            }
          />
          <textarea
            placeholder="Description"
            value={newStoryboard.description}
            onChange={(e) =>
              setNewStoryboard({ ...newStoryboard, description: e.target.value })
            }
          />
          <input type="file" onChange={handleFileChange} />
          <button
            onClick={isEditing ? handleEditStoryboard : handleAddStoryboard}
            style={{ marginTop: "10px" }}
          >
            {isEditing ? "Save Changes" : "Add"}
          </button>
        </Modal>
      )}
    </div>
  );
};

export default Storyboards;
