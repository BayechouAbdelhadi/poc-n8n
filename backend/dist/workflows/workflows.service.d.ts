import { HttpService } from '@nestjs/axios';
export declare class WorkflowsService {
    private readonly httpService;
    constructor(httpService: HttpService);
    getWorkflows(): Promise<any[]>;
    getWorkflow(id: string): Promise<any>;
    getN8nUrl(path?: string): Promise<{
        url: string;
    }>;
    getExecutions(workflowId: string): Promise<any[]>;
}
