import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({ token: localStorage.getItem('token'), user: null, isAuthenticated: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                // Check if token is expired
                if (decodedUser.exp * 1000 > Date.now()) {
                    setAuth({ token, user: decodedUser.user, isAuthenticated: true });
                } else {
                    localStorage.removeItem('token');
                    setAuth({ token: null, user: null, isAuthenticated: false });
                }
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem('token');
                 setAuth({ token: null, user: null, isAuthenticated: false });
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token } = response.data;
        localStorage.setItem('token', token);
        const decodedUser = jwtDecode(token);
        setAuth({ token, user: decodedUser.user, isAuthenticated: true });
    };

    const register = async (name, email, password) => {
        const response = await api.post('/auth/register', { name, email, password });
        const { token } = response.data;
        localStorage.setItem('token', token);
        const decodedUser = jwtDecode(token);
        setAuth({ token, user: decodedUser.user, isAuthenticated: true });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setAuth({ token: null, user: null, isAuthenticated: false });
    };

    return (
        <AuthContext.Provider value={{ auth, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;