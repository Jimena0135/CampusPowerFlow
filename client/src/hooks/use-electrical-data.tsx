import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useFiwareData } from "./use-fiware-data";
import type { Building, ElectricalData, EnvironmentalData } from "@shared/schema";

export function useElectricalData() {
  const queryClient = useQueryClient();
  const [cachedElectricalData, setCachedElectricalData] = useState<Map<string, ElectricalData>>(new Map());
  const [cachedEnvironmentalData, setCachedEnvironmentalData] = useState<Map<string, EnvironmentalData>>(new Map());
  const [cachedHistoryData, setCachedHistoryData] = useState<Map<string, ElectricalData[]>>(new Map());
  
  // Hook para datos de FIWARE
  const fiwareData = useFiwareData();

  // Fetch all buildings
  const { data: buildings, isLoading: buildingsLoading } = useQuery<Building[]>({
    queryKey: ["/api/buildings"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch latest electrical data for all buildings
  useEffect(() => {
    if (buildings) {
      buildings.forEach(async (building) => {
        try {
          const response = await fetch(`/api/buildings/${building.id}/electrical-data/latest`);
          if (response.ok) {
            const data = await response.json();
            setCachedElectricalData(prev => new Map(prev).set(building.id, data));
          }
        } catch (error) {
          console.error(`Error fetching electrical data for ${building.id}:`, error);
        }

        try {
          const response = await fetch(`/api/buildings/${building.id}/environmental-data/latest`);
          if (response.ok) {
            const data = await response.json();
            setCachedEnvironmentalData(prev => new Map(prev).set(building.id, data));
          }
        } catch (error) {
          console.error(`Error fetching environmental data for ${building.id}:`, error);
        }
      });
    }
  }, [buildings]);

  // Helper functions to get data (prioritizing FIWARE when available)
  const getLatestElectricalData = (buildingId: string): ElectricalData | undefined => {
    // Primero intentar obtener datos de FIWARE
    const fiwareElectrical = fiwareData.getCachedFiwareElectricalData(buildingId);
    if (fiwareElectrical) {
      return {
        id: `fiware_${buildingId}_${Date.now()}`,
        buildingId: fiwareElectrical.buildingId,
        voltage: fiwareElectrical.voltage,
        current: fiwareElectrical.current,
        power: fiwareElectrical.power,
        powerFactor: fiwareElectrical.powerFactor,
        frequency: fiwareElectrical.frequency,
        thd: fiwareElectrical.thd,
        timestamp: new Date(fiwareElectrical.timestamp),
      };
    }
    
    // Fallback a datos locales
    return cachedElectricalData.get(buildingId);
  };

  const getLatestEnvironmentalData = (buildingId: string): EnvironmentalData | undefined => {
    // Primero intentar obtener datos de FIWARE
    const fiwareEnvironmental = fiwareData.getCachedFiwareEnvironmentalData(buildingId);
    if (fiwareEnvironmental) {
      return {
        id: `fiware_env_${buildingId}_${Date.now()}`,
        buildingId: fiwareEnvironmental.buildingId,
        temperature: fiwareEnvironmental.temperature,
        humidity: fiwareEnvironmental.humidity,
        illumination: fiwareEnvironmental.illumination,
        timestamp: new Date(fiwareEnvironmental.timestamp),
      };
    }
    
    // Fallback a datos locales
    return cachedEnvironmentalData.get(buildingId);
  };

  const getElectricalDataHistory = (buildingId: string): ElectricalData[] | undefined => {
    return cachedHistoryData.get(buildingId);
  };

  // Function to fetch historical data on demand
  const fetchElectricalDataHistory = async (buildingId: string, hours: number = 24) => {
    try {
      const response = await fetch(`/api/buildings/${buildingId}/electrical-data/history?hours=${hours}`);
      if (response.ok) {
        const data = await response.json();
        setCachedHistoryData(prev => new Map(prev).set(buildingId, data));
        return data;
      }
    } catch (error) {
      console.error(`Error fetching electrical data history for ${buildingId}:`, error);
    }
    return [];
  };

  // Update cached data when WebSocket messages arrive
  const updateElectricalData = (data: ElectricalData) => {
    setCachedElectricalData(prev => new Map(prev).set(data.buildingId, data));
    
    // Invalidate React Query cache for this building
    queryClient.invalidateQueries({ 
      queryKey: ["/api/buildings", data.buildingId, "electrical-data", "latest"] 
    });
  };

  const updateEnvironmentalData = (data: EnvironmentalData) => {
    setCachedEnvironmentalData(prev => new Map(prev).set(data.buildingId, data));
    
    // Invalidate React Query cache for this building
    queryClient.invalidateQueries({ 
      queryKey: ["/api/buildings", data.buildingId, "environmental-data", "latest"] 
    });
  };

  return {
    buildings,
    buildingsLoading,
    getLatestElectricalData,
    getLatestEnvironmentalData,
    getElectricalDataHistory,
    fetchElectricalDataHistory,
    updateElectricalData,
    updateEnvironmentalData,
    cachedElectricalData: Object.fromEntries(cachedElectricalData),
    cachedEnvironmentalData: Object.fromEntries(cachedEnvironmentalData),
    
    // FIWARE integration
    fiwareData,
    getFiwareTimeSeriesData: fiwareData.getTimeSeriesData,
    fiwareEntities: fiwareData.fiwareEntities,
    isFiwareDataAvailable: (buildingId: string) => {
      return !!(fiwareData.getCachedFiwareElectricalData(buildingId) || fiwareData.getCachedFiwareEnvironmentalData(buildingId));
    },
  };
}
