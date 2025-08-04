import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useElectricalData } from "@/hooks/use-electrical-data";
import { useQuery } from "@tanstack/react-query";
import type { Building } from "@shared/schema";

interface SystemStatusProps {
  buildings: Building[];
}

export default function SystemStatus({ buildings }: SystemStatusProps) {
  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const onlineBuildings = buildings.filter(b => b.isOnline).length;
  const totalConsumption = buildings.length * 50; // Simplified calculation
  const avgTemperature = 24.4; // Would be calculated from real data

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Estado del Sistema</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* System Overview */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Resumen General</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Sistemas Online</span>
              </div>
              <span className="text-sm font-mono text-gray-800">{onlineBuildings}/{buildings.length}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">⚡</span>
                <span className="text-sm text-gray-700">Consumo Total</span>
              </div>
              <span className="text-sm font-mono text-gray-800">{totalConsumption.toFixed(1)} kW</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-orange-600">🌡️</span>
                <span className="text-sm text-gray-700">Temp. Promedio</span>
              </div>
              <span className="text-sm font-mono text-gray-800">{avgTemperature}°C</span>
            </div>
          </div>
        </div>
        
        {/* Recent Alerts */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Alertas Recientes</h3>
          <div className="space-y-2">
            {alerts && Array.isArray(alerts) && alerts.length > 0 ? (
              alerts.slice(0, 3).map((alert: any) => (
                <div key={alert.id} className={`p-3 border-l-4 rounded-r-lg ${
                  alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
                  alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                      <p className="text-xs text-gray-600">{alert.type}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Sistema Operativo</p>
                    <p className="text-xs text-gray-600">Todos los parámetros normales</p>
                  </div>
                  <span className="text-xs text-gray-500">Ahora</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Data Sources */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Fuentes de Datos</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">🗄️</span>
                <span className="text-sm text-gray-700">PostgreSQL</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">📡</span>
                <span className="text-sm text-gray-700">SCADA System</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">☁️</span>
                <span className="text-sm text-gray-700">Weather API</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Métricas de Rendimiento</h3>
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
    </div>
  );
}
