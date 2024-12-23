import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";
import Cookies from "js-cookie";

const TaskBoard = ({ projectid }) => {
  const [tasks, setTasks] = useState({
    new: [],
    todo: [],
    in_progress: [],
    done: [],
  });

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/v1/project/${projectid}/tasks/`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("access_token")}`,
        },
      })
      .then((response) => {
        const groupedTasks = response.data.results.reduce((acc, task) => {
          acc[task.status] = acc[task.status] || [];
          acc[task.status].push(task);
          return acc;
        }, { new: [], todo: [], in_progress: [], done: [] });
        setTasks(groupedTasks);
      })
      .catch((error) => console.error("Error fetching tasks:", error));
  }, [projectid]);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceColumn = tasks[source.droppableId];
    const destColumn = tasks[destination.droppableId];
    const [movedTask] = sourceColumn.splice(source.index, 1);
    movedTask.status = destination.droppableId;
    destColumn.splice(destination.index, 0, movedTask);

    setTasks({
      ...tasks,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    });

    axios
      .put(
        `http://localhost:8000/api/v1/project/${projectid}/tasks/${movedTask.id}/`,
        movedTask,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .catch((error) => console.error("Error updating task status:", error));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-board">
        {Object.keys(tasks).map((status) => (
          <Droppable droppableId={status} key={status}>
            {(provided) => (
              <div
                className="kanban-column"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h3>{status.toUpperCase()}</h3>
                {tasks[status].map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={task.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        className="kanban-task"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <strong>{task.title}</strong>
                        <p>{task.description}</p>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default TaskBoard;
