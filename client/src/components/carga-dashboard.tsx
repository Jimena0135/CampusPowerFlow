import { useState, useEffect } from "react";
import { X, Zap, Gauge, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CargaDashboardProps {
  cargaId: string;
  cargaName: string;
  onClose: () => void;
}

export default function CargaDashboard({ cargaId, cargaName, onClose }: CargaDashboardProps) {
  // Datos simulados para la carga
  const [electricalData] = useState({
    voltage: 220.5,
    current: 15.2,
    power: 3350,
    powerFactor: 0.95,
    frequency: 60.1,
    thd: 2.1
  });

  const [environmentalData] = useState({
    temperature: 24.5,
    humidity: 45.2,
    illumination: 450
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Dashboard - {cargaName}
        </h2>
        <p className="text-gray-600">
          Monitoreo en tiempo real de la carga eléctrica
        </p>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Voltaje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{electricalData.voltage}V</div>
            <div className="text-xs text-blue-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              Normal
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center">
              <Gauge className="w-4 h-4 mr-2" />
              Corriente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{electricalData.current}A</div>
            <div className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              Estable
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Potencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{electricalData.power}W</div>
            <div className="text-xs text-purple-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              Óptimo
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Electrical Parameters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Parámetros Eléctricos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Factor de Potencia</span>
              <span className="text-sm font-semibold">{electricalData.powerFactor}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Frecuencia</span>
              <span className="text-sm font-semibold">{electricalData.frequency} Hz</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">THD</span>
              <span className="text-sm font-semibold">{electricalData.thd}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Environmental Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Condiciones Ambientales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Temperatura</span>
              <span className="text-sm font-semibold">{environmentalData.temperature}°C</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Humedad</span>
              <span className="text-sm font-semibold">{environmentalData.humidity}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Iluminación</span>
              <span className="text-sm font-semibold">{environmentalData.illumination} lux</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Indicators */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                <span className="text-xs text-gray-600">Conexión</span>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                <span className="text-xs text-gray-600">Alimentación</span>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                <span className="text-xs text-gray-600">Carga</span>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                <span className="text-xs text-gray-600">Temperatura</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}