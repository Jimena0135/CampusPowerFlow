import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useElectricalData } from "@/hooks/use-electrical-data";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FiwareStatus from "./fiware-status";
import type { Building } from "@shared/schema";

interface SystemStatusProps {
  buildings: Building[];
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function SystemStatus({ buildings, isOpen, onToggle }: SystemStatusProps) {
  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const onlineBuildings = buildings.filter(b => b.isOnline).length;
  const totalConsumption = buildings.length * 50; // Simplified calculation
  const avgTemperature = 24.4; // Would be calculated from real data

  return (
    <div className="w-full bg-white border-t xl:border-t-0 xl:border-l border-gray-200 flex flex-col h-full">
      {isOpen ? (
        // Vista completa
        <>
          <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Estado del Sistema</h2>
              {onToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="p-2 hover:bg-gray-100"
                  title="Minimizar panel"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
            {/* System Overview */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 sticky top-0 bg-white py-1 z-10">Resumen General</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm text-gray-700">Sistemas Online</span>
                  </div>
                  <span className="text-xs sm:text-sm font-mono text-gray-800">{onlineBuildings}/{buildings.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600">⚡</span>
                    <span className="text-xs sm:text-sm text-gray-700">Consumo Total</span>
                  </div>
                  <span className="text-xs sm:text-sm font-mono text-gray-800">{totalConsumption.toFixed(1)} kW</span>
                </div>
                
                <div className="flex items-center justify-between p-2 sm:p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-600">🌡️</span>
                    <span className="text-xs sm:text-sm text-gray-700">
                      <span className="hidden sm:inline">Temp. Promedio</span>
                      <span className="sm:hidden">Temp.</span>
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-mono text-gray-800">{avgTemperature}°C</span>
                </div>
              </div>
            </div>

            {/* FIWARE Status */}
            <FiwareStatus className="w-full" />

            {/* Buildings Status */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 sticky top-0 bg-white py-1 z-10">Edificios</h3>
              <div className="space-y-2">
                {buildings.length > 0 ? buildings.map((building) => (
                  <div 
                    key={building.id} 
                    className="p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {/* Handle building click if needed */}}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${building.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{building.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{building.isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                    {building.isOnline && (
                      <div className="mt-2 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Potencia:</span>
                          <span className="font-mono">{(Math.random() * 100).toFixed(1)} kW</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Consumo:</span>
                          <span className="font-mono">{(Math.random() * 50).toFixed(1)} A</span>
                        </div>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center text-gray-500 text-sm py-4">
                    No hay edificios disponibles
                  </div>
                )}
              </div>
            </div>

            {/* Alerts Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 sticky top-0 bg-white py-1 z-10">Alertas Recientes</h3>
              <div className="space-y-2">
                {alerts && alerts.length > 0 ? alerts.map((alert: any, index: number) => (
                  <div 
                    key={index}
                    className={`p-2 sm:p-3 rounded-lg border ${
                      alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                      alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <div className={`w-2 h-2 rounded-full mt-1 ${
                        alert.severity === 'high' ? 'bg-red-500' :
                        alert.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-800 font-medium truncate">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-800">Sistema Normal</p>
                        <p className="text-xs text-gray-500">Todos los parámetros en rango</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Data Sources */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 sticky top-0 bg-white py-1 z-10">Fuentes de Datos</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">🗄️</span>
                    <span className="text-xs sm:text-sm text-gray-700">PostgreSQL</span>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">📡</span>
                    <span className="text-xs sm:text-sm text-gray-700">SCADA System</span>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">☁️</span>
                    <span className="text-xs sm:text-sm text-gray-700">Weather API</span>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Performance Metrics */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 sticky top-0 bg-white py-1 z-10">Métricas de Rendimiento</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Eficiencia Energética</span>
                    <span className="text-xs font-mono text-gray-800">88.7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '88.7%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Disponibilidad</span>
                    <span className="text-xs font-mono text-gray-800">99.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '99.2%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Vista minimizada - barra lateral pequeña con texto vertical
        <div className="w-full h-full flex flex-col bg-gray-50">
          {/* Botón para expandir en la parte superior */}
          <div className="flex justify-center p-2 border-b border-gray-200">
            {onToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="Expandir panel"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {/* Texto vertical */}
          <div className="flex-1 flex items-center justify-center py-4">
            <div className="transform -rotate-90 whitespace-nowrap">
              <span className="text-sm font-medium text-gray-700">
                Estado del Sistema
              </span>
            </div>
          </div>
          
          {/* Indicadores de estado minimizados */}
          <div className="flex flex-col items-center space-y-3 p-3 border-t border-gray-200">
            <div 
              className={`w-3 h-3 rounded-full ${onlineBuildings > 0 ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} 
              title={`${onlineBuildings}/${buildings.length} sistemas online`}
            ></div>
            <div 
              className="w-3 h-3 rounded-full bg-blue-500" 
              title={`${totalConsumption.toFixed(1)} kW consumo total`}
            ></div>
            <div 
              className="w-3 h-3 rounded-full bg-orange-500" 
              title={`${avgTemperature}°C temperatura promedio`}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}