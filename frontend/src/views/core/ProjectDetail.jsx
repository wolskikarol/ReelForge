import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import AddMemberForm from './AddMemberForm.jsx';
import Header from '../partials/Header.jsx';
import Footer from '../partials/Footer.jsx';
import Moment from '../../plugin/Moment.js';
import MomentWithTime from '../../plugin/MomentTime.js';
import useUserData from '../../plugin/useUserData.js';
import SidePanel from '../partials/SidePanel.jsx';
import "./css/ProjectDetail.css";

const ProjectDetail = () => {
    const { projectid } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user_id = useUserData().user_id;

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const token = Cookies.get('access_token');
                if (!token) {
                    setError('You must be logged in!');
                    return;
                }

                const response = await axios.get(`http://127.0.0.1:8000/api/v1/project/${projectid}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setProject(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to retrieve project details.');
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectid]);

    const deleteProject = async () => {
        try {
            const token = Cookies.get('access_token');
            if (!token) {
                setError('You must be logged in!');
                return;
            }

            await axios.delete(`http://127.0.0.1:8000/api/v1/project/${projectid}/delete/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            navigate('/');
        } catch (err) {
            setError('Failed to delete the project!');
        }
    };

    const handleMemberAdded = (newMember) => {
        setProject((prevProject) => ({
            ...prevProject,
            members: [...prevProject.members, newMember],
        }));
    };

    const removeMember = async (email) => {
        try {
            const token = Cookies.get('access_token');
            if (!token) {
                setError('You must be logged in!');
                return;
            }

            await axios.post(
                `http://127.0.0.1:8000/api/v1/project/${projectid}/remove-member/`,
                { email },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setProject((prevProject) => ({
                ...prevProject,
                members: prevProject.members.filter((member) => member.email !== email),
            }));

        } catch (err) {
            setError('Failed to remove project member.');
        }
    };

    if (loading) {
        return <p>Loading project details...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    console.log('Project members:', project.members);

    return (
        <div className="app-container">
            <Header />
            <div className="content-container">
                <SidePanel />
                <div className="main-content">
                    <div className="project-container">
                        <h1 className="project-title">{project.title}</h1>
                        <p className="project-description">
                            Creator: {project.author?.full_name || 'Unknown creator'}
                        </p>
                        <p className="project-description">{project.description}</p>
                        <p>Created {Moment(project.created_at)}</p>
                        <p>Last modified {MomentWithTime(project.last_modified)}</p>
                        
                        <h3>Members:</h3>
                        {Array.isArray(project.members) && project.members.length > 0 ? (
                            <ul className="project-members">
                                {project.members.map((member, index) => (
                                    <li key={index}>
                                        <span>{member.full_name || 'unknown'} ({member.email || 'unknown'})</span>
                                        {user_id === project.author.id && (
                                            <button
                                                className="delete-button"
                                                onClick={() => removeMember(member.email)}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No members in the project.</p>
                        )}
                        
                        {user_id === project.author.id && (
                            <div className="add-member-container">
                                <AddMemberForm
                                    projectId={projectid}
                                    onMemberAdded={handleMemberAdded}
                                />
                                <button
                                    className="delete-button"
                                    onClick={deleteProject}
                                >
                                    Delete Project
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
    
};

export default ProjectDetail;
