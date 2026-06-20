export interface CoordinationSignal {
  type: 'task_assignment' | 'completion_flag' | 'finding' | 'error';
  fromAgentId: string;
  toAgentId?: string;
  data: string;
  timestamp: number;
}

export class AgentCoordinator {
  private signals: Map<string, CoordinationSignal[]> = new Map();

  send(signal: CoordinationSignal): void {
    const key = signal.toAgentId || 'broadcast';
    const existing = this.signals.get(key) || [];
    existing.push(signal);
    this.signals.set(key, existing);
  }

  receiveFor(agentId: string): CoordinationSignal[] {
    const direct = this.signals.get(agentId) || [];
    const broadcast = this.signals.get('broadcast') || [];
    return [...direct, ...broadcast].sort((a, b) => a.timestamp - b.timestamp);
  }

  getContextFor(agentId: string): string {
    const signals = this.receiveFor(agentId);
    if (signals.length === 0) return '';

    return signals
      .map(s => `[${s.type.toUpperCase()}] From ${s.fromAgentId}: ${s.data}`)
      .join('\n');
  }

  clear(): void {
    this.signals.clear();
  }
}

export const coordinator = new AgentCoordinator();
