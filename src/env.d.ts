/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to "false" to use live backend. Defaults to mock. */
  readonly VITE_USE_MOCK?: string;
  /** Backend base URL, e.g. http://localhost:8080/api/v1 */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
