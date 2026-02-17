import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Fix: Cast process to any to prevent TS error "Property 'cwd' does not exist on type 'Process'"
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Prioritize env file, then fallback to process.env (system vars)
  const apiKey = env.API_KEY || process.env.API_KEY || '';

  return {
    plugins: [react()],
    define: {
      // Explicitly define process.env.API_KEY. using || '' ensures it is replaced by an empty string if missing, 
      // rather than undefined, preventing "process is not defined" errors in the browser.
      'process.env.API_KEY': JSON.stringify(apiKey)
    },
    server: {
      port: 3000,
      host: true
    }
  };
});