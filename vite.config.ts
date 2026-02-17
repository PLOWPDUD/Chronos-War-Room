
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Prioritize env file, then fallback to process.env (system vars)
  const apiKey = env.API_KEY || process.env.API_KEY;

  return {
    plugins: [react()],
    define: {
      // Explicitly define process.env.API_KEY so it gets replaced by the actual key string during build.
      'process.env.API_KEY': JSON.stringify(apiKey)
    },
    server: {
      port: 3000,
      host: true
    }
  };
});
