import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, User } from '../api/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const verifyUser = async () => {
        try {
            const { user } = await authApi.verify();
            setUser(user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        verifyUser();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authApi.login({ email, password });
        setUser(response.user);
        // Store token for future requests
        if (response.accessToken) {
            localStorage.setItem('access_token', response.accessToken);
        }
    };

    const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
        const response = await authApi.register({
            email,
            password,
            firstName,
            lastName,
        });
        setUser(response.user);
        // Store token for future requests
        if (response.accessToken) {
            localStorage.setItem('access_token', response.accessToken);
        }
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
        // Clear stored token
        localStorage.removeItem('access_token');
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
