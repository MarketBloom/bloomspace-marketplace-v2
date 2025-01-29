import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    esbuild: {
      jsx: 'automatic'
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@components': path.resolve(__dirname, './src/components'),
        '@features': path.resolve(__dirname, './src/features'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@types': path.resolve(__dirname, './src/types'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@integrations': path.resolve(__dirname, './src/integrations'),
        '@public': path.resolve(__dirname, './public')
      }
    },
    publicDir: 'public',
    server: {
      port: 8080,
      host: true,
      watch: {
        usePolling: true,
      },
      fs: {
        strict: false,
        allow: ['..']
      },
    },
    preview: {
      port: 8080,
      host: true,
    },
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    },
    define: {
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
        VITE_SUPABASE_URL: JSON.stringify(env.VITE_SUPABASE_URL),
        VITE_SUPABASE_ANON_KEY: JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        VITE_GOOGLE_MAPS_API_KEY: JSON.stringify(env.VITE_GOOGLE_MAPS_API_KEY),
        VITE_SENTRY_DSN: JSON.stringify(env.VITE_SENTRY_DSN),
        VITE_APP_NAME: JSON.stringify(env.VITE_APP_NAME),
        VITE_APP_URL: JSON.stringify(env.VITE_APP_URL),
        VITE_API_URL: JSON.stringify(env.VITE_API_URL),
        VITE_ENABLE_MOCK_API: JSON.stringify(env.VITE_ENABLE_MOCK_API),
        VITE_DEBUG: JSON.stringify(env.VITE_DEBUG),
      }
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        '@supabase/supabase-js'
      ]
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
      globals: true
    }
  }
});