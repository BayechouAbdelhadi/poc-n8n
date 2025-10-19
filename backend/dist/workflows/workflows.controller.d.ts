import { WorkflowsService } from './workflows.service';
export declare class WorkflowsController {
    private readonly workflowsService;
    constructor(workflowsService: WorkflowsService);
    getWorkflows(): Promise<any[]>;
    getN8nUrl(path?: string): Promise<{
        url: string;
    }>;
    getWorkflow(id: string): Promise<any>;
    getExecutions(id: string): Promise<any[]>;
}
