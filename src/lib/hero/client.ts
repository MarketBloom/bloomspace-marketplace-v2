import { HeroClient } from '@hero-api/client'

if (!import.meta.env.VITE_HERO_API_KEY) {
  throw new Error('Missing Hero API key')
}

export const heroClient = new HeroClient({
  apiKey: import.meta.env.VITE_HERO_API_KEY
}) 