import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

export const AuthContext = createContext(undefined, undefined);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(localStorage.getItem('token') ? JSON.parse(localStorage.getItem('user') || '{}') : null);

    const login = (newToken, userData, navigate) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        }
        
        // Redirect to overview page after successful login
        if (navigate) {
            navigate('/overview', { replace: true });
        }
    };
    
    const logout = (navigate) => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        
        if (navigate) {
            navigate('/', { replace: true }); // Redirect to homepage after logout
        }
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);