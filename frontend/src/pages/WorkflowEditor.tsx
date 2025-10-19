import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { workflowsApi } from '../api/workflows';
import './WorkflowEditor.css';

const WorkflowEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [n8nUrl, setN8nUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const loadN8nUrl = async () => {
            try {
                setLoading(true);
                setError('');

                // Determine the path based on whether we're creating new or editing
                const path = id ? `/workflow/${id}` : '/workflow/new';

                const { url } = await workflowsApi.getN8nUrl(path);
                setN8nUrl(url);
            } catch (err: any) {
                console.error('Failed to load n8n URL:', err);
                setError(err.response?.data?.message || 'Failed to load workflow editor');
            } finally {
                setLoading(false);
            }
        };

        loadN8nUrl();
    }, [id]);

    // Listen for messages from n8n iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Security: verify origin if needed
            console.log('Message from n8n:', event.data);

            // Handle workflow save events
            if (event.data.type === 'workflow-saved') {
                console.log('Workflow saved:', event.data.workflowId);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    if (loading) {
        return (
            <div className="workflow-editor">
                <Header />
                <div className="editor-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading workflow editor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="workflow-editor">
                <Header />
                <div className="editor-error">
                    <h2>Error Loading Editor</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="workflow-editor">
            <Header />
            <div className="editor-container">
                <iframe
                    src={n8nUrl}
                    className="n8n-iframe"
                    title="n8n Workflow Editor"
                    allow="clipboard-read; clipboard-write"
                />
            </div>
        </div>
    );
};

export default WorkflowEditor;
