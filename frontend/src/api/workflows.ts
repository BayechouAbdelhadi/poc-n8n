import api from "./axios";

export const workflowsApi = {
  async getWorkflows(): Promise<any[]> {
    const response = await api.get("/workflows");
    return response.data;
  },

  async getWorkflow(id: string): Promise<any> {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  },

  async getN8nUrl(path: string = ""): Promise<{ url: string }> {
    const response = await api.get("/workflows/n8n-url", {
      params: { path },
    });
    return response.data;
  },

  async getExecutions(workflowId: string): Promise<any[]> {
    const response = await api.get(`/workflows/${workflowId}/executions`);
    return response.data;
  },
};
