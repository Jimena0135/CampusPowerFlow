import { useState, useEffect } from "react";
import { X, TrendingUp, TrendingDown, Zap, Gauge, BarChart3, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useElectricalData } from "@/hooks/use-electrical-data";
import type { Building } from "@shared/schema";

interface BuildingDashboardProps {
  buildingId: string;
  onClose: () => void;
}

export default function BuildingDashboard({ buildingId, onClose }: BuildingDashboardProps) {
  const { buildings, getLatestElectricalData, getLatestEnvironmentalData, getElectricalDataHistory } = useElectricalData();
  const [building, setBuilding] = useState<Building | null>(null);

  useEffect(() => {
    const foundBuilding = buildings?.find(b => b.id === buildingId);
    setBuilding(foundBuilding || null);
  }, [buildingId, buildings]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const electricalData = getLatestElectricalData(buildingId);
  const environmentalData = getLatestEnvironmentalData(buildingId);
  const historyData = getElectricalDataHistory(buildingId);

  if (!building) {
    return null;
  }

  const buildingNames: Record<string, string> = {
    'BLOQUE_A': 'Dashboard - Bloque A (Ingeniería)',
    'BLOQUE_B': 'Dashboard - Bloque B (Administrativo)',
    'BLOQUE_C': 'Dashboard - Bloque C (Laboratorios)'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              {buildingNames[buildingId] || `Dashboard - ${building.name}`}
            </h2>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${building.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">{building.isOnline ? 'En línea' : 'Desconectado'}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Key Metrics Cards */}
            <div className="col-span-12 grid grid-cols-4 gap-4 mb-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Voltaje Promedio</p>
                      <p className="text-2xl font-bold text-blue-600 font-mono">
                        {electricalData ? `${electricalData.voltage.toFixed(1)} V` : 'N/A'}
                      </p>
                    </div>
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600">+0.2% </span>
                    <span className="text-gray-500">vs hora anterior</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Corriente</p>
                      <p className="text-2xl font-bold text-orange-600 font-mono">
                        {electricalData ? `${electricalData.current.toFixed(1)} A` : 'N/A'}
                      </p>
                    </div>
                    <Gauge className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    <span className="text-red-600">-1.5% </span>
                    <span className="text-gray-500">vs hora anterior</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Potencia Activa</p>
                      <p className="text-2xl font-bold text-green-600 font-mono">
                        {electricalData ? `${electricalData.power.toFixed(1)} kW` : 'N/A'}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600">+3.1% </span>
                    <span className="text-gray-500">vs hora anterior</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Factor de Potencia</p>
                      <p className="text-2xl font-bold text-purple-600 font-mono">
                        {electricalData ? electricalData.powerFactor.toFixed(2) : 'N/A'}
                      </p>
                    </div>
                    <Scale className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600">+0.02 </span>
                    <span className="text-gray-500">vs hora anterior</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts Section */}
            <div className="col-span-8 space-y-6">
              {/* Power Consumption Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Consumo de Potencia (Últimas 24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="w-16 h-16 mx-auto mb-2" />
                      <p>Gráfico de Consumo de Potencia</p>
                      <p className="text-sm">Integración con Chart.js</p>
                      {historyData && (
                        <p className="text-xs mt-2">{historyData.length} puntos de datos disponibles</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Voltage Quality Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Calidad de Voltaje</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center border">
                    <div className="text-center text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded flex items-center justify-center">
                        <span className="text-2xl">〜</span>
                      </div>
                      <p>Forma de Onda de Voltaje</p>
                      <p className="text-sm">
                        THD: {electricalData ? `${electricalData.thd.toFixed(1)}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Environmental & Controls */}
            <div className="col-span-4 space-y-6">
              {/* Environmental Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle>Condiciones Ambientales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm text-gray-700">Temperatura</span>
                    </div>
                    <span className="text-lg font-mono text-gray-800">
                      {environmentalData ? `${environmentalData.temperature.toFixed(1)}°C` : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm text-gray-700">Humedad</span>
                    </div>
                    <span className="text-lg font-mono text-gray-800">
                      {environmentalData ? `${environmentalData.humidity.toFixed(0)}%` : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-sm text-gray-700">Iluminación</span>
                    </div>
                    <span className="text-lg font-mono text-gray-800">
                      {environmentalData ? `${environmentalData.illumination.toFixed(0)} lux` : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Control Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones de Control</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                    <span className="mr-2">⚡</span>Reset Sistema
                  </Button>
                  <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">
                    <span className="mr-2">📊</span>Exportar Datos
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <span className="mr-2">⚙️</span>Configuración
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
