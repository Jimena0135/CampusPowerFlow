import { useState, useEffect } from "react";
import { X, BatteryCharging, Activity, Zap, Gauge, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface BateriaInversorDashboardProps {
  bateriaId: string;
  bateriaName: string;
  onClose: () => void;
}

export default function BateriaInversorDashboard({ bateriaId, bateriaName, onClose }: BateriaInversorDashboardProps) {
  // Datos simulados para la batería con inversor
  const [batteryData, setBatteryData] = useState({
    voltage: 48.2,
    current: 10.5,
    soc: 85,
    power: 500,
    acPower: 480,
    dcPower: 520,
    status: "Cargando"
  });

  const [historicalData, setHistoricalData] = useState(() => {
    const data = [];
    const now = Date.now();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now - i * 5 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        voltage: 48 + Math.random() * 2 - 1,
        current: 10 + Math.random() * 2 - 1,
        soc: 80 + Math.random() * 10 - 5,
        power: 500 + Math.random() * 50 - 25,
        acPower: 480 + Math.random() * 40 - 20,
        dcPower: 520 + Math.random() * 40 - 20
      });
    }
    return data;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const newData = {
        voltage: 48 + Math.random() * 2 - 1,
        current: 10 + Math.random() * 2 - 1,
        soc: Math.max(0, Math.min(100, batteryData.soc + (Math.random() - 0.5) * 2)),
        power: 500 + Math.random() * 50 - 25,
        acPower: 480 + Math.random() * 40 - 20,
        dcPower: 520 + Math.random() * 40 - 20,
        status: Math.random() > 0.5 ? "Cargando" : "Descargando"
      };
      setBatteryData(newData);
      setHistoricalData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          voltage: newData.voltage,
          current: newData.current,
          soc: newData.soc,
          power: newData.power,
          acPower: newData.acPower,
          dcPower: newData.dcPower
        };
        return [...prev.slice(1), newPoint];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [batteryData.soc]);

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
          Dashboard - {bateriaName}
        </h2>
        <p className="text-gray-600">
          Monitoreo en tiempo real de la batería con inversor
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center">
              <BatteryCharging className="w-4 h-4 mr-2" /> Voltaje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{batteryData.voltage.toFixed(1)} V</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 flex items-center">
              <Activity className="w-4 h-4 mr-2" /> Corriente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{batteryData.current.toFixed(1)} A</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
              <Zap className="w-4 h-4 mr-2" /> Potencia Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{batteryData.power.toFixed(0)} W</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
              <Gauge className="w-4 h-4 mr-2" /> Estado de Carga (SOC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{batteryData.soc.toFixed(0)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-pink-700 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" /> AC Power
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-900">{batteryData.acPower.toFixed(0)} W</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2" /> DC Power
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">{batteryData.dcPower.toFixed(0)} W</div>
          </CardContent>
        </Card>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Histórico de Potencia AC y DC</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={historicalData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis yAxisId="left" domain={[400, 600]} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="acPower" stroke="#f472b6" name="AC Power (W)" />
            <Line yAxisId="left" type="monotone" dataKey="dcPower" stroke="#818cf8" name="DC Power (W)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
