import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = Cookies.get('access_token');
                if (!token) {
                    setError('Musisz być zalogowany.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://127.0.0.1:8000/api/v1/project/list/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setProjects(response.data);
                setLoading(false);
            } catch (err) {
                setError('Nie udało się pobrać projektów.');
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) {
        return <p>Loading Projects...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h1>Your Projects</h1>
            <ul>
                {projects.map((project) => (
                    <li key={project.id}>
                        <Link to={`/project/${project.id}`}>{project.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProjectList;
