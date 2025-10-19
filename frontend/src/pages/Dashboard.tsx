import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleCreateWorkflow = () => {
        navigate('/workflow/new');
    };

    return (
        <div className="dashboard">
            <Header />

            <main className="dashboard-content">
                <div className="welcome-section">
                    <h1>Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!</h1>
                    <p>Ready to automate your workflows?</p>
                </div>

                <div className="quick-actions">
                    <div className="action-card" onClick={handleCreateWorkflow}>
                        <div className="action-icon">+</div>
                        <h3>Create New Workflow</h3>
                        <p>Start building your automation workflow with n8n</p>
                    </div>

                    <div className="action-card">
                        <div className="action-icon">📊</div>
                        <h3>View Workflows</h3>
                        <p>Browse and manage your existing workflows</p>
                    </div>

                    <div className="action-card">
                        <div className="action-icon">⚡</div>
                        <h3>Executions</h3>
                        <p>Monitor your workflow execution history</p>
                    </div>

                    <div className="action-card">
                        <div className="action-icon">⚙️</div>
                        <h3>Settings</h3>
                        <p>Configure your account and preferences</p>
                    </div>
                </div>

                <div className="info-section">
                    <div className="info-card">
                        <h3>🔐 JWT-Based SSO</h3>
                        <p>
                            This platform uses JWT-based Single Sign-On to seamlessly authenticate you with n8n.
                            When you create or edit a workflow, you'll be automatically logged into n8n without any additional credentials.
                        </p>
                    </div>

                    <div className="info-card">
                        <h3>🚀 Getting Started</h3>
                        <p>
                            Click "Create New Workflow" to start building your first automation.
                            The n8n editor will open in a secure iframe with your authentication already handled.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
