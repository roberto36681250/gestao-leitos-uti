// Metas e limites de WIP e Aging
export const HIGIENE_WIP = 2; // Meta de leitos em higienização
export const META_ALTA_MIN = 90; // Meta em minutos para Alta Sinalizada
export const META_HIGIENE_MIN = 45; // Meta em minutos para Higienização

// Estados críticos que precisam de aging
export const CRITICAL_STATES: readonly string[] = ['Alta Sinalizada', 'Higienização'];

