import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const AddMemberForm = ({ projectId, onMemberAdded }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = Cookies.get('access_token');
            if (!token) {
                setMessage('You must be logged in!');
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
            setEmail('');
        } catch (err) {
            setMessage('Failed to add member.');
        }
    };

    return (
        <div>
            <h4>Add Project Member</h4>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="User Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Add</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default AddMemberForm;
