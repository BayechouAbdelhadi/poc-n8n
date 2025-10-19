import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WorkflowsService {
  constructor(private readonly httpService: HttpService) {}

  async getWorkflows(): Promise<any[]> {
    const n8nUrl = process.env.N8N_INTERNAL_URL || 'http://n8n:5678';
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.get(`${n8nUrl}/api/v1/workflows`)
    );
    return response.data;
  }

  async getWorkflow(id: string): Promise<any> {
    const n8nUrl = process.env.N8N_INTERNAL_URL || 'http://n8n:5678';
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.get(`${n8nUrl}/api/v1/workflows/${id}`)
    );
    return response.data;
  }

  async getN8nUrl(path: string = ''): Promise<{ url: string }> {
    const n8nUrl = process.env.N8N_URL || 'http://n8n.saas.local';
    const fullPath = path ? `/${path}` : '';
    return { url: `${n8nUrl}${fullPath}` };
  }

  async getExecutions(workflowId: string): Promise<any[]> {
    const n8nUrl = process.env.N8N_INTERNAL_URL || 'http://n8n:5678';
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.get(`${n8nUrl}/api/v1/executions?workflowId=${workflowId}`)
    );
    return response.data;
  }
}