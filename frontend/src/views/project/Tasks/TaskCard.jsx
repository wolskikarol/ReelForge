import React, { useState } from "react";
import { useDrag } from "react-dnd";

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
      className="task-card"
      style={{
        opacity: isDragging ? 0.5 : 1,
        border: "1px solid gray",
        padding: "8px",
        margin: "8px",
        backgroundColor: "white",
        borderRadius: "5px",
        cursor: "pointer",
        maxWidth: "250px",
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div>
        <strong>{task.title}</strong>
        <p style={{ fontSize: "12px", color: "#555" }}>
          Assigned to: {assignedUser ? assignedUser.full_name || assignedUser.email : "Unassigned"}
        </p>
      </div>

      {isExpanded && (
        <div style={{ marginTop: "8px", fontSize: "12px" }}>
          <p><strong>Description:</strong> {task.description}</p>
          <p><strong>Status:</strong> {task.status}</p>
          <select
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onAssign(task.id, e.target.value)}
            defaultValue={task.assigned_to || ""}
          >
            <option value="" disabled>
              Assign user
            </option>
            {projectUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name || user.email}
              </option>
            ))}
          </select>
          <div style={{ marginTop: "8px" }}>
            <button
              style={{
                padding: "4px 8px",
                marginRight: "4px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
            >
              Edit
            </button>
            <button
              style={{
                padding: "4px 8px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
              }}
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
