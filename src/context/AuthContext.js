'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { getAnglesApiBaseUrl } from '../utils/runtime-config';

// Ensure axios sends cookies for session-based auth
axios.defaults.withCredentials = true;

const AuthContext = createContext({});

// The API returns `loginUrl` as a root-relative path (/rest/api/v1.0/auth/sso/:id)
// because it is the same value the IdP has registered. axios is configured with a
// baseURL that already includes the version prefix, so a browser redirect has to be
// built from the API *origin* instead to avoid doubling it up.
export const buildProviderUrl = (loginUrl) => `${getAnglesApiBaseUrl()}${loginUrl}`;

// Normalises the user payload: the API reports `role`, the UI has always read
// `userType`.
const normaliseUser = (userData) => {
    if (userData && userData.role && !userData.userType) {
        return { ...userData, userType: userData.role };
    }
    return userData;
};

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
            // Default config fallback: local login only, so the page stays usable.
            setAuthConfig({ localAuthEnabled: true, providers: [] });
        }
    };

    const checkUser = async () => {
        try {
            const response = await axios.get('/auth/me', { withCredentials: true });
            setUser(normaliseUser(response.data));
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
        const userData = normaliseUser(response.data.user || response.data);
        setUser(userData);
        return userData;
    };

    // LDAP / Active Directory is a direct bind rather than a browser redirect: the
    // credentials are posted to the provider's own login route and the response looks
    // like the local one.
    const loginWithProvider = async (provider, username, password) => {
        const response = await axios.post(
            `/auth/sso/${provider.id}/login`,
            { username, password },
            { withCredentials: true },
        );
        const userData = normaliseUser(response.data.user || response.data);
        setUser(userData);
        return userData;
    };

    // OIDC and SAML both start with a full-page redirect to the API, which hands off to
    // the identity provider and returns to the callback it has registered.
    const startProviderLogin = (provider) => {
        window.location.href = buildProviderUrl(provider.loginUrl);
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
        <AuthContext.Provider
            value={{
                user,
                authConfig,
                isLoading,
                login,
                loginWithProvider,
                startProviderLogin,
                logout,
                checkUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
