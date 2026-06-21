import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const runtimeUrl = env.VITE_RUNTIME_URL || 'http://localhost:3001';

  return {
    plugins: [
      tanstackStart({ server: { entry: 'server' } }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      port: 5173,
      proxy: {
        '/api': { target: runtimeUrl, changeOrigin: true },
        '/health': { target: runtimeUrl, changeOrigin: true },
        '/auth': { target: runtimeUrl, changeOrigin: true },
      },
    },
    build: {
      target: 'esnext',
      minify: mode === 'production' ? 'esbuild' : false,
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor';
            }
            if (id.includes('@tanstack/')) {
              return 'tanstack';
            }
            if (id.includes('@radix-ui/')) {
              return 'ui';
            }
          },
        },
      },
    },
    preview: {
      port: 5173,
      host: '0.0.0.0',
    },
  };
});
