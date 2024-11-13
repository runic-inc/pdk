/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PUBLIC_ONCHAINKIT_API_KEY: string,
    readonly VITE_PUBLIC_PONDER_URL: string,
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }