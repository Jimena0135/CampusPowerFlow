import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface FiwareElectricalData {
  buildingId: string;
  voltage: number;
  current: number;
  power: number;
  powerFactor: number;
  frequency: number;
  thd: number;
  timestamp: Date;
}

interface FiwareEnvironmentalData {
  buildingId: string;
  temperature: number;
  humidity: number;
  illumination: number;
  timestamp: Date;
}

interface FiwareEntity {
  id: string;
  type: string;
  [key: string]: any;
}

export function useFiwareData() {
  const [cachedFiwareElectricalData, setCachedFiwareElectricalData] = useState<Map<string, FiwareElectricalData>>(new Map());
  const [cachedFiwareEnvironmentalData, setCachedFiwareEnvironmentalData] = useState<Map<string, FiwareEnvironmentalData>>(new Map());

  // Fetch FIWARE entities
  const { data: fiwareEntities, isLoading: entitiesLoading } = useQuery<FiwareEntity[]>({
    queryKey: ["/api/fiware/entities"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Function to get FIWARE electrical data for a specific building
  const getFiwareElectricalData = async (buildingId: string): Promise<FiwareElectricalData | null> => {
    try {
      const response = await fetch(`/api/fiware/buildings/${buildingId}/electrical-data`);
      if (response.ok) {
        const data = await response.json();
        setCachedFiwareElectricalData(prev => new Map(prev).set(buildingId, data));
        return data;
      }
    } catch (error) {
      console.error(`Error fetching FIWARE electrical data for ${buildingId}:`, error);
    }
    return null;
  };

  // Function to get FIWARE environmental data for a specific building
  const getFiwareEnvironmentalData = async (buildingId: string): Promise<FiwareEnvironmentalData | null> => {
    try {
      const response = await fetch(`/api/fiware/buildings/${buildingId}/environmental-data`);
      if (response.ok) {
        const data = await response.json();
        setCachedFiwareEnvironmentalData(prev => new Map(prev).set(buildingId, data));
        return data;
      }
    } catch (error) {
      console.error(`Error fetching FIWARE environmental data for ${buildingId}:`, error);
    }
    return null;
  };

  // Function to get time series data from CrateDB
  const getTimeSeriesData = async (entityId: string, attribute: string, hours: number = 24): Promise<any[]> => {
    try {
      const response = await fetch(`/api/fiware/timeseries/${entityId}/${attribute}?hours=${hours}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error(`Error fetching time series data for ${entityId}.${attribute}:`, error);
    }
    return [];
  };

  // Automatically fetch FIWARE data for all buildings
  useEffect(() => {
    const buildings = ['BLOQUE_A', 'BLOQUE_B', 'BLOQUE_C'];
    
    const fetchAllFiwareData = async () => {
      for (const buildingId of buildings) {
        await getFiwareElectricalData(buildingId);
        await getFiwareEnvironmentalData(buildingId);
      }
    };

    fetchAllFiwareData();
    
    // Set up interval to fetch data periodically
    const interval = setInterval(fetchAllFiwareData, 15000); // Every 15 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Helper functions to get cached data
  const getCachedFiwareElectricalData = (buildingId: string): FiwareElectricalData | undefined => {
    return cachedFiwareElectricalData.get(buildingId);
  };

  const getCachedFiwareEnvironmentalData = (buildingId: string): FiwareEnvironmentalData | undefined => {
    return cachedFiwareEnvironmentalData.get(buildingId);
  };

  // Function to check if FIWARE data is more recent than local data
  const isFiwareDataNewer = (buildingId: string, localTimestamp?: Date): boolean => {
    const fiwareElectrical = cachedFiwareElectricalData.get(buildingId);
    const fiwareEnvironmental = cachedFiwareEnvironmentalData.get(buildingId);
    
    if (!localTimestamp) return true;
    
    const fiwareTimestamp = fiwareElectrical?.timestamp || fiwareEnvironmental?.timestamp;
    if (!fiwareTimestamp) return false;
    
    return new Date(fiwareTimestamp) > localTimestamp;
  };

  return {
    // FIWARE entities
    fiwareEntities,
    entitiesLoading,
    
    // Data fetching functions
    getFiwareElectricalData,
    getFiwareEnvironmentalData,
    getTimeSeriesData,
    
    // Cached data getters
    getCachedFiwareElectricalData,
    getCachedFiwareEnvironmentalData,
    
    // Utility functions
    isFiwareDataNewer,
    
    // Raw cached data
    cachedFiwareElectricalData: Object.fromEntries(cachedFiwareElectricalData),
    cachedFiwareEnvironmentalData: Object.fromEntries(cachedFiwareEnvironmentalData),
  };
}
