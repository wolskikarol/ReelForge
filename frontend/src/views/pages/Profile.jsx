import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "./Pages.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const token = Cookies.get("access_token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile(token);
        setProfile(data);
      } catch (err) {
        setError("Unable to fetch profile.");
      }
    };

    fetchProfile();
  }, [token]);

  const getProfile = async (token) => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/v1/profile/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!profile) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="app">
      <Header />
      <div className="app-content">
        <div className="profile-container">
          <div className="profile-card">
            <img
              src={profile.image}
              alt={`${profile.user.username}'s avatar`}
              className="profile-avatar"
            />
            <h2 className="profile-name">
              {profile.full_name || profile.user.username}
            </h2>
            <p className="profile-bio">
              {profile.bio || "This user hasn't written a bio yet."}
            </p>
            <div className="profile-info">
              <p>
                <strong>Username:</strong> {profile.user.username}
              </p>
              <p>
                <strong>Email:</strong> {profile.user.email}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
