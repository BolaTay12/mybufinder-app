
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check localStorage on mount
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse user from localStorage", error);
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData) => {
        try {
            setError(null); // Clear previous errors
            if (!userData.matricNumber && !userData.email) {
                throw new Error("Matric Number or Email is required.");
            }

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            if (userData.token) {
                localStorage.setItem('token', userData.token);
            }
        } catch (err) {
            setError(err.message);
            console.error("Login failed:", err);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        setError(null);
    };

    const clearError = () => setError(null);

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN' || user?.role === 'admin' || user?.email?.toLowerCase() === 'admin@babcock.edu.ng' || user?.matricNumber?.toLowerCase() === 'admin',
        isLoading,
        error,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
