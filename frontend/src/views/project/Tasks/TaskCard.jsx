import React, { useState } from "react";
import { useDrag } from "react-dnd";
import "./css/TaskCard.css";

const TaskCard = ({ task, projectUsers, onDelete, onEdit, onAssign }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TASK",
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const assignedUser = projectUsers.find((user) => user.id === task.assigned_to);

  return (
    <div
      ref={drag}
      className={`task-card ${isDragging ? "dragging" : ""}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="task-card-header">
        <strong>{task.title}</strong>
        <p>Assigned to: {assignedUser ? assignedUser.full_name || assignedUser.email : "Unassigned"}</p>
      </div>

      {isExpanded && (
        <div className="task-card-expanded">
          <p><strong>Description:</strong> {task.description}</p>
          <p><strong>Status:</strong> {task.status}</p>
          <select
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onAssign(task.id, e.target.value)}
            defaultValue={task.assigned_to || ""}
          >
            <option value="" disabled>Assign user</option>
            {projectUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name || user.email}
              </option>
            ))}
          </select>
          <div className="task-card-buttons">
            <button
              className="edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
            >
              Edit
            </button>
            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
