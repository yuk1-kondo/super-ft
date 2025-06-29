/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'exifreader' {
  export function load(file: ArrayBuffer | string): any
  export function loadView(dataView: DataView): any
  export function errors(): any
}

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_GOOGLE_CLOUD_API_KEY: string
  readonly VITE_OPENWEATHER_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
