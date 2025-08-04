import { useState, useEffect } from "react";
import { X, Zap, Gauge, TrendingUp, TrendingDown, BarChart3, Activity, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

interface CargaDashboardProps {
  cargaId: string;
  cargaName: string;
  onClose: () => void;
}

export default function CargaDashboard({ cargaId, cargaName, onClose }: CargaDashboardProps) {
  // Datos en tiempo real para la carga
  const [electricalData, setElectricalData] = useState({
    voltage: 220.5,
    current: 15.2,
    power: 3350,
    powerFactor: 0.95,
    frequency: 60.1,
    thd: 2.1
  });

  const [environmentalData, setEnvironmentalData] = useState({
    temperature: 24.5,
    humidity: 45.2,
    illumination: 450
  });

  // Datos históricos para gráficas (últimos 24 puntos = últimas 2 horas)
  const [historicalData, setHistoricalData] = useState(() => {
    const data = [];
    const now = Date.now();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now - i * 5 * 60 * 1000); // Cada 5 minutos
      data.push({
        time: time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        voltage: 220 + Math.random() * 5 - 2.5,
        current: 15 + Math.random() * 3 - 1.5,
        power: 3300 + Math.random() * 200 - 100,
        powerFactor: 0.95 + Math.random() * 0.08 - 0.04,
        frequency: 60 + Math.random() * 0.4 - 0.2,
        thd: 2 + Math.random() * 1 - 0.5,
        temperature: 24 + Math.random() * 4 - 2,
        humidity: 45 + Math.random() * 10 - 5
      });
    }
    return data;
  });

  // Simulación de datos en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = {
        voltage: 220 + Math.random() * 5 - 2.5,
        current: 15 + Math.random() * 3 - 1.5,
        power: 3300 + Math.random() * 200 - 100,
        powerFactor: 0.95 + Math.random() * 0.08 - 0.04,
        frequency: 60 + Math.random() * 0.4 - 0.2,
        thd: 2 + Math.random() * 1 - 0.5
      };
      
      const newEnvData = {
        temperature: 24 + Math.random() * 4 - 2,
        humidity: 45 + Math.random() * 10 - 5,
        illumination: 450 + Math.random() * 100 - 50
      };

      setElectricalData(newData);
      setEnvironmentalData(newEnvData);

      // Actualizar datos históricos
      setHistoricalData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          voltage: newData.voltage,
          current: newData.current,
          power: newData.power,
          powerFactor: newData.powerFactor,
          frequency: newData.frequency,
          thd: newData.thd,
          temperature: newEnvData.temperature,
          humidity: newEnvData.humidity
        };
        
        return [...prev.slice(1), newPoint]; // Mantener solo los últimos 24 puntos
      });
    }, 3000); // Actualizar cada 3 segundos

    return () => clearInterval(interval);
  }, []);

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
            <div className="text-2xl font-bold text-blue-900">{electricalData.voltage.toFixed(1)}V</div>
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
            <div className="text-2xl font-bold text-green-900">{electricalData.current.toFixed(1)}A</div>
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
            <div className="text-2xl font-bold text-purple-900">{Math.round(electricalData.power)}W</div>
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
              <span className="text-sm font-semibold">{electricalData.powerFactor.toFixed(3)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Frecuencia</span>
              <span className="text-sm font-semibold">{electricalData.frequency.toFixed(1)} Hz</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">THD</span>
              <span className="text-sm font-semibold">{electricalData.thd.toFixed(1)}%</span>
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
              <span className="text-sm font-semibold">{environmentalData.temperature.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Humedad</span>
              <span className="text-sm font-semibold">{environmentalData.humidity.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Iluminación</span>
              <span className="text-sm font-semibold">{Math.round(environmentalData.illumination)} lux</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Charts */}
      <div className="mt-6 space-y-6">
        {/* Electrical Parameters Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Parámetros Eléctricos en Tiempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={(label) => `Hora: ${label}`}
                    formatter={(value, name) => [
                      typeof value === 'number' ? value.toFixed(2) : value,
                      name === 'voltage' ? 'Voltaje (V)' :
                      name === 'current' ? 'Corriente (A)' :
                      name === 'power' ? 'Potencia (W)' : name
                    ]}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="voltage" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Voltaje (V)"
                    dot={false}
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="current" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Corriente (A)"
                    dot={false}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="power" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Potencia (W)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Power Quality Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Calidad de Energía
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={(label) => `Hora: ${label}`}
                    formatter={(value, name) => [
                      typeof value === 'number' ? value.toFixed(3) : value,
                      name === 'powerFactor' ? 'Factor de Potencia' :
                      name === 'frequency' ? 'Frecuencia (Hz)' : 
                      name === 'thd' ? 'THD (%)' : name
                    ]}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="powerFactor"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#fbbf24"
                    name="Factor de Potencia"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="frequency"
                    stackId="2"
                    stroke="#06b6d4"
                    fill="#67e8f9"
                    name="Frecuencia (Hz)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="thd"
                    stackId="3"
                    stroke="#ef4444"
                    fill="#fca5a5"
                    name="THD (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Environmental Data Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <Thermometer className="w-5 h-5 mr-2" />
              Condiciones Ambientales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={(label) => `Hora: ${label}`}
                    formatter={(value, name) => [
                      typeof value === 'number' ? value.toFixed(1) : value,
                      name === 'temperature' ? 'Temperatura (°C)' :
                      name === 'humidity' ? 'Humedad (%)' : name
                    ]}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#dc2626" 
                    strokeWidth={2}
                    name="Temperatura (°C)"
                    dot={false}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#059669" 
                    strokeWidth={2}
                    name="Humedad (%)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
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