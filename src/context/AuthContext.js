'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Ensure axios sends cookies for session-based auth
axios.defaults.withCredentials = true;

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authConfig, setAuthConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadConfig = async () => {
        try {
            const response = await axios.get('/auth/config', { withCredentials: true });
            setAuthConfig(response.data);
        } catch (error) {
            console.error('Failed to load auth config', error);
            // Default config fallback
            setAuthConfig({ localAuthEnabled: true, oktaAuthEnabled: false });
        }
    };

    const checkUser = async () => {
        try {
            const response = await axios.get('/auth/me', { withCredentials: true });
            // Check if backend uses userType or role
            const userData = response.data;
            if (userData.role && !userData.userType) {
                userData.userType = userData.role;
            }
            setUser(userData);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // User is simply not logged in, ignore silently
            } else {
                console.error('Failed to load user', error);
            }
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadConfig();
        checkUser();
    }, []);

    const login = async (username, password) => {
        const response = await axios.post('/auth/login', { username, password }, { withCredentials: true });
        const userData = response.data.user || response.data;
        if (userData.role && !userData.userType) {
            userData.userType = userData.role;
        }
        setUser(userData);
        return userData;
    };

    const logout = async () => {
        try {
            await axios.post('/auth/logout', {}, { withCredentials: true });
        } catch (error) {
            // ignore
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, authConfig, isLoading, login, logout, checkUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
