// Asset manifest for Voyage art with local placeholder fallback.
export const artManifest = {
  card: (id: string) => `/voyage-art/card-${id}.png`,
  bg: (id: string) => `/voyage-art/bg-${id}.png`,
  piper: '/mascot/piper-fullbody-thinking.png',
  earth: '/imagery/nasa-blue-marble.jpg',
  world: '/voyage/world.png',
  worldMetadata: '/voyage/world.json',
} as const;
