import { useState, useEffect } from "react";
import { X, Sun, Zap, Gauge, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface GeneradorSolarDashboardProps {
  generadorId: string;
  generadorName: string;
  onClose: () => void;
}

export default function GeneradorSolarDashboard({ generadorId, generadorName, onClose }: GeneradorSolarDashboardProps) {
  // Datos simulados para el generador solar
  const [solarData, setSolarData] = useState({
    voltage: 380,
    current: 8.2,
    power: 3100,
    irradiance: 850,
    temperature: 36.5,
    status: "Operando"
  });

  const [historicalData, setHistoricalData] = useState(() => {
    const data = [];
    const now = Date.now();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now - i * 5 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        voltage: 380 + Math.random() * 10 - 5,
        current: 8 + Math.random() * 1.5 - 0.75,
        power: 3100 + Math.random() * 200 - 100,
        irradiance: 850 + Math.random() * 100 - 50,
        temperature: 36 + Math.random() * 4 - 2
      });
    }
    return data;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const newData = {
        voltage: 380 + Math.random() * 10 - 5,
        current: 8 + Math.random() * 1.5 - 0.75,
        power: 3100 + Math.random() * 200 - 100,
        irradiance: 850 + Math.random() * 100 - 50,
        temperature: 36 + Math.random() * 4 - 2,
        status: Math.random() > 0.1 ? "Operando" : "Standby"
      };
      setSolarData(newData);
      setHistoricalData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          voltage: newData.voltage,
          current: newData.current,
          power: newData.power,
          irradiance: newData.irradiance,
          temperature: newData.temperature
        };
        return [...prev.slice(1), newPoint];
      });
    }, 3000);
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
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Dashboard - {generadorName}
        </h2>
        <p className="text-gray-600">
          Monitoreo en tiempo real del generador solar
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 flex items-center">
              <Sun className="w-4 h-4 mr-2" /> Irradiancia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{solarData.irradiance.toFixed(0)} W/m²</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
              <Zap className="w-4 h-4 mr-2" /> Potencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{solarData.power.toFixed(0)} W</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center">
              <Gauge className="w-4 h-4 mr-2" /> Voltaje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{solarData.voltage.toFixed(1)} V</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" /> Corriente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{solarData.current.toFixed(2)} A</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-pink-700 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2" /> Temperatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-900">{solarData.temperature.toFixed(1)} °C</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700 flex items-center">
              <Zap className="w-4 h-4 mr-2" /> Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">{solarData.status}</div>
          </CardContent>
        </Card>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Histórico de Potencia e Irradiancia</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={historicalData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis yAxisId="left" domain={[0, 1200]} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="power" stroke="#38bdf8" name="Potencia (W)" />
            <Line yAxisId="left" type="monotone" dataKey="irradiance" stroke="#facc15" name="Irradiancia (W/m²)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
