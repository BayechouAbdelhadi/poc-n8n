import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleLogoClick = () => {
        navigate('/dashboard');
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <h1 className="logo" onClick={handleLogoClick}>
                        n8n SaaS Platform
                    </h1>
                </div>

                <div className="header-right">
                    <span className="user-email">{user?.email}</span>
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
