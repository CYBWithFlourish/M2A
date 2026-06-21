import { createRuntimeMemoryRouter } from './MemoryRouter.js';

const result = createRuntimeMemoryRouter();

export const memoryRouter = result.memoryRouter;
export const agentRunner = result.agentRunner;
export const workflowParser = result.workflowParser;
export const { platformAccountId, platformDelegateKey } = result;
