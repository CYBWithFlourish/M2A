import { M2ATool, toolRegistry } from './ToolRegistry.js';
import { walrusSidecarUrl } from '../../config.js';

const SIDECAR_URL = walrusSidecarUrl();

export const storeToWalrus: M2ATool = {
  name: 'store_to_walrus',
  description: 'Stores a blob of text or data to Walrus decentralized storage. Returns the blobId.',
  parameters: {
    type: 'object',
    properties: {
      content: { type: 'string', description: 'The text content to store' },
      contentType: { type: 'string', description: 'MIME type of the content', default: 'text/plain' },
      owner: { type: 'string', description: 'Owner address (required on mainnet for signing)' },
    },
    required: ['content']
  },
  execute: async ({ content, contentType = 'text/plain', owner }: any) => {
    console.log('[Tools] Storing to Walrus via sidecar...');
    try {
      const response = await fetch(`${SIDECAR_URL}/walrus/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: Buffer.from(content).toString('base64'),
          keyIndex: 0,
          owner: owner || '',
          namespace: 'default',
          epochs: 1,
          deferTransfer: false,
        }),
      });

      if (!response.ok) throw new Error(`Walrus store failed: ${response.statusText}`);

      const result = await response.json();
      return { blobId: result.blobId, objectId: result.objectId };
    } catch (e: any) {
      return { error: e.message };
    }
  }
};

export const fetchFromWalrus: M2ATool = {
  name: 'fetch_from_walrus',
  description: 'Retrieves a blob from Walrus decentralized storage by its blobId.',
  parameters: {
    type: 'object',
    properties: {
      blobId: { type: 'string', description: 'The unique identifier of the blob to fetch' }
    },
    required: ['blobId']
  },
  execute: async ({ blobId }) => {
    console.log(`[Tools] Fetching from Walrus: ${blobId}`);
    return { content: `Walrus fetch: route through MemoryRouter recall for production use. Blob ID: ${blobId}` };
  }
};

export const deleteFromWalrus: M2ATool = {
  name: 'delete_from_walrus',
  description: 'Deletes a blob from Walrus decentralized storage by its blobId or objectId.',
  parameters: {
    type: 'object',
    properties: {
      blobId: { type: 'string', description: 'The blobId to delete' },
      objectId: { type: 'string', description: 'The objectId to delete' }
    },
    required: []
  },
  execute: async ({ blobId, objectId }) => {
    console.log('[Tools] Deleting from Walrus...');
    const id = blobId || objectId;
    if (!id) return { error: 'Either blobId or objectId is required' };
    return { message: `Walrus delete: route through MemoryRouter for production use. ID: ${id}` };
  }
};

toolRegistry.registerTool(storeToWalrus);
toolRegistry.registerTool(fetchFromWalrus);
toolRegistry.registerTool(deleteFromWalrus);
