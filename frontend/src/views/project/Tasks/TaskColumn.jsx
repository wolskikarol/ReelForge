import React from "react";
import { useDrop } from "react-dnd";
import TaskCard from "./TaskCard";

const TaskColumn = ({ status, tasks, onDrop, onDelete, onEdit, onAssign, projectUsers }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TASK",
    drop: (item) => onDrop(item, status),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className="task-column"
      style={{
        backgroundColor: isOver ? "#f0f0f0" : "#e0e0e0",
        padding: "16px",
        margin: "8px",
        minWidth: "200px",
        minHeight: "400px",
      }}
    >
      <h3>{status.toUpperCase()}</h3>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onDelete={onDelete}
          onEdit={onEdit}
          onAssign={onAssign}
          projectUsers={projectUsers}
        />
      ))}
    </div>
  );
};

export default TaskColumn;
