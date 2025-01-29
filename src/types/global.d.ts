interface ImportMetaEnv {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_GOOGLE_MAPS_API_KEY: string;
  VITE_SENTRY_DSN: string;
  VITE_APP_NAME: string;
  VITE_APP_URL: string;
  VITE_API_URL: string;
  VITE_ENABLE_MOCK_API: string;
  VITE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}