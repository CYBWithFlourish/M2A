import { Buiry } from './index.js';

export interface BuiryMemoryConfig {
  buiry: Buiry;
  namespace?: string;
  inputKey?: string;
  outputKey?: string;
  returnMessages?: boolean;
}

export class BuiryMemory {
  private config: BuiryMemoryConfig;
  private chatHistory: Array<{ role: 'human' | 'ai'; content: string }> = [];

  constructor(config: BuiryMemoryConfig) {
    this.config = {
      inputKey: 'input',
      outputKey: 'output',
      returnMessages: false,
      ...config,
    };
  }

  get memoryKeys(): string[] {
    return [this.config.inputKey || 'input'];
  }

  async loadMemoryVariables(inputs: Record<string, any>): Promise<Record<string, any>> {
    const query = inputs[this.config.inputKey || 'input'] || '';

    let context = '';
    try {
      const memories = await this.config.buiry.recall(query, {
        namespace: this.config.namespace,
        limit: 10,
      });
      context = memories.map(m => m.content).join('\n\n');
    } catch {
      context = this.chatHistory
        .map(m => `${m.role === 'human' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');
    }

    if (!context && this.chatHistory.length > 0) {
      context = this.chatHistory
        .map(m => `${m.role === 'human' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');
    }

    if (this.config.returnMessages) {
      return { [this.config.outputKey || 'history']: context };
    }

    return { [this.config.outputKey || 'history']: context || 'No previous context available.' };
  }

  async saveContext(
    inputValues: Record<string, any>,
    outputValues: Record<string, any>,
  ): Promise<void> {
    const userInput = inputValues[this.config.inputKey || 'input'] || '';
    const aiOutput = outputValues[this.config.outputKey || 'output'] || '';

    if (userInput) {
      this.chatHistory.push({ role: 'human', content: userInput });
    }
    if (aiOutput) {
      this.chatHistory.push({ role: 'ai', content: aiOutput });
    }

    try {
      await this.config.buiry.remember(
        `User: ${userInput}\nAssistant: ${aiOutput}`,
        { namespace: this.config.namespace },
      );
    } catch {
    }
  }

  async clear(): Promise<void> {
    this.chatHistory = [];
  }
}
