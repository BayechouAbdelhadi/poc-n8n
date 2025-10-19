import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WorkflowEditor from './pages/WorkflowEditor';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/workflow/new"
                    element={
                        <PrivateRoute>
                            <WorkflowEditor />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/workflow/:id"
                    element={
                        <PrivateRoute>
                            <WorkflowEditor />
                        </PrivateRoute>
                    }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </div>
    );
}

export default App;
