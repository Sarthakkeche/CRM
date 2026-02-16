import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { register } = useAuth();
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await register(formData.name, formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            // Handle error (e.g., show error message)
        }
    };

    return (
        <div className="auth-container">

        {/* Server Notice Box */}
        <div
            style={{
                padding: "12px",
                marginBottom: "15px",
                border: "3px solid",
                borderImage: "linear-gradient(45deg, red, green, blue) 1",
                borderRadius: "8px",
                backgroundColor: "#111",
                color: "#fff",
                fontSize: "14px",
                textAlign: "center",
                animation: "pulse 2s infinite"
            }}
        >
            ⚠️ Please wait as the server may take time to respond.  
            I am using a free hosting service, so the server may be in sleep mode.  
            Please wait — it's working.
        </div>

        
            <h2>Register</h2>
            <form onSubmit={onSubmit}>
                <input type="text" name="name" placeholder="Name" onChange={onChange} required />
                <input type="email" name="email" placeholder="Email" onChange={onChange} required />
                <input type="password" name="password" placeholder="Password" onChange={onChange} required />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default RegisterPage;