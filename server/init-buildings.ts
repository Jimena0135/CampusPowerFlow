import { db } from "./db";

// Ya no inicializamos edificios por defecto
// El sistema ahora trabaja solo con componentes eléctricos individuales
export async function initializeDefaultBuildings() {
  console.log('Sistema configurado para trabajar con componentes individuales');
  console.log('No se inicializan edificios por defecto');
  // No hacer nada - el sistema ahora trabaja sin edificios
  return;
}

// Función para mapear entidades FIWARE a edificios
export const FIWARE_ENTITY_MAPPING = {
  // Smart Meters
  'SmartMeter_BLOQUE_A': 'BLOQUE_A',
  'SmartMeter_BLOQUE_B': 'BLOQUE_B', 
  'SmartMeter_BLOQUE_C': 'BLOQUE_C',
  
  // Weather Stations
  'WeatherStation_A': 'BLOQUE_A',
  'WeatherStation_B': 'BLOQUE_B',
  'WeatherStation_C': 'BLOQUE_C',
  
  // Inverters (if applicable)
  'FroniusInverter_A': 'BLOQUE_A',
  'EnphaseInverter_B': 'BLOQUE_B',
  
  // Add more mappings as needed
};

// Función para obtener el buildingId desde una entidad FIWARE
export function getBuildingIdFromFiwareEntity(entityId: string): string | null {
  return FIWARE_ENTITY_MAPPING[entityId] || null;
}

// Función para obtener entidades FIWARE asociadas a un edificio
export function getFiwareEntitiesForBuilding(buildingId: string): string[] {
  return Object.entries(FIWARE_ENTITY_MAPPING)
    .filter(([_, building]) => building === buildingId)
    .map(([entity, _]) => entity);
}
