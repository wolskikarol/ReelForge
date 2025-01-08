import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const AddMemberForm = ({ projectId, onMemberAdded }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = Cookies.get("access_token");
      if (!token) {
        setMessage("You must be logged in!");
        setMessageType("error");
        return;
      }

      const response = await axios.post(
        `http://127.0.0.1:8000/api/v1/project/${projectId}/add-member/`,
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newMember = response.data;
      onMemberAdded(newMember);
      setEmail("");
      setMessage("Member added successfully!");
      setMessageType("success");
    } catch (err) {
      setMessage("Failed to add member.");
      setMessageType("error");
    }
  };

  return (
    <div className="add-member-container">
      <h4>Add Project Member</h4>
      <form className="add-member-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="User Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Add</button>
      </form>
      {message && (
        <p className={`add-member-message ${messageType}`}>{message}</p>
      )}
    </div>
  );
};

export default AddMemberForm;
