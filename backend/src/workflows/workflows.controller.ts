import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getWorkflows() {
    return this.workflowsService.getWorkflows();
  }

  @Get('n8n-url')
  @UseGuards(JwtAuthGuard)
  getN8nUrl(@Query('path') path?: string) {
    return this.workflowsService.getN8nUrl(path);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getWorkflow(@Param('id') id: string) {
    return this.workflowsService.getWorkflow(id);
  }

  @Get(':id/executions')
  @UseGuards(JwtAuthGuard)
  getExecutions(@Param('id') id: string) {
    return this.workflowsService.getExecutions(id);
  }
}