/// <reference types="vite/client" />

declare module '@vercel/analytics/react' {
  import type { ComponentType } from 'react'
  export const Analytics: ComponentType<{
    beforeSend?: (event: any) => any
    debug?: boolean
    mode?: 'auto' | 'development' | 'production'
  }>
}
