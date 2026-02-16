import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await login(formData.email, formData.password);
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

        
            <h2>Login</h2>
            <form onSubmit={onSubmit}>
                <input type="email" name="email" placeholder="Email" onChange={onChange} required />
                <input type="password" name="password" placeholder="Password" onChange={onChange} required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;