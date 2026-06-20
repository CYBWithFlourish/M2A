import { Response } from 'express';

export interface ExecutionEvent {
  type: 'node:start' | 'node:progress' | 'node:complete' | 'node:error' | 'workflow:complete';
  nodeId?: string;
  nodeLabel?: string;
  stage?: 'started' | 'recalling_memory' | 'agent_running' | 'saving_artifacts' | 'completed' | 'failed';
  output?: string;
  error?: string;
  status?: string;
  results?: Record<string, string>;
  timestamp: number;
  message?: string;
}

export class StreamEmitter {
  private clientResponse?: Response;

  setResponse(res: Response) {
    this.clientResponse = res;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
  }

  emit(event: ExecutionEvent) {
    if (this.clientResponse) {
      this.clientResponse.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  }

  end() {
    if (this.clientResponse) {
      this.clientResponse.end();
    }
  }
}
