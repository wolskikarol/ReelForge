import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import useUserData from "../../../plugin/useUserData.js";
import Header from "../../partials/Header.jsx";
import Footer from "../../partials/Footer.jsx";
import SidePanel from "../../partials/SidePanel.jsx";
import "./css/Schedules.css";

const Schedules = () => {
  const { projectid } = useParams();
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    attendees: [],
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const localizer = momentLocalizer(moment);
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [isAttending, setIsAttending] = useState(false);
  const user_id = useUserData().user_id;

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/v1/project/${projectid}/events/`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("access_token")}`,
        },
      })
      .then((response) => {
        const formattedEvents = response.data.map((event) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          description: event.description,
          attendees: event.attendees || [],
          isAttending: (event.attendees || []).some(
            (attendee) => attendee.id === user_id
          ),
        }));

        setEvents(formattedEvents);
        console.log("Formatted Events:", formattedEvents);
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, [projectid]);

  const handleAddEvent = () => {
    axios
      .post(
        `http://localhost:8000/api/v1/project/${projectid}/events/`,
        {
          ...newEvent,
          start_time: moment(newEvent.start_time).toISOString(),
          end_time: moment(newEvent.end_time).toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
          },
        }
      )
      .then((response) => {
        setEvents([
          ...events,
          {
            id: response.data.id,
            title: response.data.title,
            start: new Date(response.data.start_time),
            end: new Date(response.data.end_time),
            description: response.data.description,
            attendees: [],
            isAttending: false,
          },
        ]);
        setNewEvent({
          title: "",
          description: "",
          start_time: "",
          end_time: "",
        });
        setShowModal(false);
      })
      .catch((error) => console.error("Error adding event:", error));
  };

  const handleDeleteEvent = (eventId) => {
    axios
      .delete(
        `http://localhost:8000/api/v1/project/${projectid}/events/${eventId}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
          },
        }
      )
      .then(() => {
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== eventId)
        );
        setShowDetailsModal(false);
      })
      .catch((error) => console.error("Error deleting event:", error));
  };

  const handleSelectEvent = (event) => {
    console.log("Selected Event:", event);
    setSelectedEvent(event);
    setIsAttending(event.isAttending);
    setShowDetailsModal(true);
  };

  const toggleAttendance = () => {
    axios
      .post(
        `http://localhost:8000/api/v1/events/${selectedEvent.id}/toggle-attendance/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
          },
        }
      )
      .then((response) => {
        const user = {
          id: user_id,
          full_name: useUserData().full_name || "Your Full Name",
        };

        const updatedAttendees = selectedEvent.isAttending
          ? selectedEvent.attendees.filter(
              (attendee) => attendee.id !== user_id
            )
          : [...selectedEvent.attendees, user];

        setSelectedEvent((prevSelectedEvent) => ({
          ...prevSelectedEvent,
          attendees: updatedAttendees,
          isAttending: !prevSelectedEvent.isAttending,
        }));

        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === selectedEvent.id
              ? {
                  ...event,
                  attendees: updatedAttendees,
                  isAttending: !event.isAttending,
                }
              : event
          )
        );

        console.log("Updated attendees:", updatedAttendees);
      })
      .catch((error) => console.error("Error toggling attendance:", error));
  };

  return (
    <div className="app-container">
      <Header />
      <div className="content-container">
        <SidePanel />
        <div className="main-content">
          <h2 className="schedules-header">Project Schedule</h2>
          <button
            className="add-event-button"
            onClick={() => setShowModal(true)}
          >
            Add New Event
          </button>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{
              height: "100%",
              borderRadius: "10px",
              marginTop: "10px",
            }}
            onSelectEvent={(event) => {
              setSelectedEvent(event);
              setShowDetailsModal(true);
            }}
            view={view}
            onView={(newView) => setView(newView)}
            date={date}
            onNavigate={(newDate) => setDate(newDate)}
          />

          {/* Modal: Dodawanie nowego wydarzenia */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Add New Event</h3>
                <input
                  type="text"
                  placeholder="Title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                />
                <textarea
                  placeholder="Description"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                />
                <input
                  type="datetime-local"
                  value={newEvent.start_time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, start_time: e.target.value })
                  }
                />
                <input
                  type="datetime-local"
                  value={newEvent.end_time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, end_time: e.target.value })
                  }
                />
                <button onClick={handleAddEvent}>Save</button>
                <button onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Modal: Szczegóły wydarzenia */}
          {showDetailsModal && selectedEvent && (
            <div className="modal-overlay">
              <div className="modal-content">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  style={{ float: "right", marginBottom: "10px" }}
                >
                  Close
                </button>
                <h3>Event Details</h3>
                <p>
                  <strong>Title:</strong> {selectedEvent.title}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent.description}
                </p>
                <p>
                  <strong>Start:</strong> {selectedEvent.start.toLocaleString()}
                </p>
                <p>
                  <strong>End:</strong> {selectedEvent.end.toLocaleString()}
                </p>
                <button onClick={toggleAttendance}>
                  {selectedEvent.isAttending
                    ? "Cancel Attendance"
                    : "Join Event"}
                </button>
                <p>
                  <strong>Attendees:</strong>
                </p>
                <ul>
                  {selectedEvent.attendees.map((attendee) => (
                    <li
                      key={attendee.id}
                      style={{
                        fontWeight: attendee.id === user_id ? "bold" : "normal",
                        color: attendee.id === user_id ? "#007bff" : "#000",
                      }}
                    >
                      {attendee.full_name}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  style={{ backgroundColor: "red", color: "white" }}
                >
                  Delete Event
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Schedules;
