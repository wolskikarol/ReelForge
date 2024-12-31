import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Modal from "react-modal";
import TaskColumn from "./TaskColumn";
import AddTaskForm from "./AddTaskForm";
import EditTaskForm from "./EditTaskForm";
import axios from "axios";
import Cookies from "js-cookie";
import Header from "../../partials/Header";
import Footer from "../../partials/Footer";
import SidePanel from "../../partials/SidePanel";
import "./css/TaskBoard.css"

Modal.setAppElement("#root");

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [projectUsers, setProjectUsers] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { projectid } = useParams();

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/v1/project/${projectid}/tasks/`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("access_token")}`,
        },
      })
      .then((response) => setTasks(response.data.results))
      .catch((error) => console.error("Error fetching tasks:", error));

    axios
      .get(`http://localhost:8000/api/v1/project/${projectid}/users/`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("access_token")}`,
        },
      })
      .then((response) => setProjectUsers(response.data))
      .catch((error) => console.error("Error fetching project users:", error));

  }, [projectid]);

  const handleDrop = (item, newStatus) => {
    const updatedTask = { ...item, status: newStatus };
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        task.id === updatedTask.id ? { ...task, status: newStatus } : task
      );
      return [...updatedTasks];
    });

    axios
      .put(
        `http://localhost:8000/api/v1/project/${projectid}/tasks/${item.id}/`,
        updatedTask,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .catch((error) => console.error("Error updating task status:", error));
  };

  const handleAddTask = (newTask) => {
    axios
      .post(
        `http://localhost:8000/api/v1/project/${projectid}/tasks/`,
        newTask,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setTasks((prevTasks) => [...prevTasks, response.data]);
      })
      .catch((error) => console.error("Error adding task:", error));
  };

  const handleDeleteTask = (taskId) => {
    axios
      .delete(
        `http://localhost:8000/api/v1/project/${projectid}/tasks/${taskId}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
          },
        }
      )
      .then(() => {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      })
      .catch((error) => console.error("Error deleting task:", error));
  };

  const handleEditTask = (updatedTask) => {
    axios
      .put(
        `http://localhost:8000/api/v1/project/${projectid}/tasks/${updatedTask.id}/`,
        updatedTask,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === response.data.id ? response.data : task
          )
        );
        setEditingTask(null);
      })
      .catch((error) => console.error("Error editing task:", error));
  };

  const handleAssignUser = (taskId, userId) => {
    axios
      .put(
        `http://localhost:8000/api/v1/project/${projectid}/tasks/${taskId}/`,
        { assigned_to: userId },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === response.data.id ? response.data : task
          )
        );
      })
      .catch((error) => console.error("Error assigning user:", error));
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setEditingTask(null);
    setIsEditModalOpen(false);
  };

  const statuses = ["new", "todo", "in_progress", "done"];

  return (
    <div className="app-container">
      <Header />
      <div className="content-container">
        <SidePanel />
        <div className="main-content task-board-container">
          <DndProvider backend={HTML5Backend}>
            <button className="add-task-button" onClick={openAddModal}>
              Add Task
            </button>
            <div className="task-board">
              {statuses.map((status) => (
                <TaskColumn
                  key={status}
                  status={status}
                  tasks={tasks.filter((task) => task.status === status)}
                  projectUsers={projectUsers}
                  onDrop={handleDrop}
                  onDelete={handleDeleteTask}
                  onEdit={openEditModal}
                  onAssign={handleAssignUser}
                />
              ))}
            </div>
          </DndProvider>

          {/* Modal: Dodawanie zadania */}
          <Modal
            isOpen={isAddModalOpen}
            onRequestClose={closeAddModal}
            className="modal-content"
            overlayClassName="modal-overlay"
          >
            <h2>Add Task</h2>
            <AddTaskForm
              onAdd={(task) => {
                handleAddTask(task);
                closeAddModal();
              }}
            />
            <button className="cancel-button" onClick={closeAddModal}>
              Cancel
            </button>
          </Modal>

          {/* Modal: Edycja zadania */}
          <Modal
            isOpen={isEditModalOpen}
            onRequestClose={closeEditModal}
            className="modal-content"
            overlayClassName="modal-overlay"
          >
            <h2>Edit Task</h2>
            {editingTask && (
              <EditTaskForm
                task={editingTask}
                onSave={(updatedTask) => {
                  handleEditTask(updatedTask);
                  closeEditModal();
                }}
                onCancel={closeEditModal}
              />
            )}
          </Modal>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TaskBoard;
