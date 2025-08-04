import { useState } from "react";
import DiagramCanvas from "@/components/diagram-canvas";
import ComponentLibrary from "@/components/component-library";
import SystemStatus from "@/components/system-status";
import BuildingDashboard from "@/components/building-dashboard";
import { useWebSocket } from "@/hooks/use-websocket";
import { useElectricalData } from "@/hooks/use-electrical-data";
import { Play, Pause, Save, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ElectricalDiagram() {
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

  const { isConnected } = useWebSocket({
    onElectricalDataUpdate: () => {
      setLastUpdate(new Date().toLocaleTimeString());
    },
    onEnvironmentalDataUpdate: () => {
      setLastUpdate(new Date().toLocaleTimeString());
    },
  });

  const { buildings } = useElectricalData();

  const handleBuildingClick = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
  };

  const closeBuildingDashboard = () => {
    setSelectedBuildingId(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header/Toolbar */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="text-xl text-blue-600">⚡</div>
            <h1 className="text-xl font-semibold text-gray-800">Diagrama Unifilar Eléctrico</h1>
            <span className="text-sm text-gray-500">| Universidad Nacional</span>
          </div>
          
          <div className="flex items-center space-x-2 ml-8">
            <Button
              onClick={() => setIsRealTimeActive(!isRealTimeActive)}
              className={`px-3 py-1.5 text-sm ${
                isRealTimeActive 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {isRealTimeActive ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
              {isRealTimeActive ? "Tiempo Real" : "Pausar"}
            </Button>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-1" />
              Guardar
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-gray-600">{isConnected ? "Conectado" : "Desconectado"}</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Última actualización: <span className="font-mono">{lastUpdate}</span></span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" title="Configuración">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Ayuda">
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Component Library */}
        <ComponentLibrary />

        {/* Main Canvas Area */}
        <DiagramCanvas 
          buildings={buildings || []} 
          onBuildingClick={handleBuildingClick}
          isRealTimeActive={isRealTimeActive}
        />

        {/* Right Sidebar - System Status */}
        <SystemStatus buildings={buildings || []} />
      </div>

      {/* Building Dashboard Modal */}
      {selectedBuildingId && (
        <BuildingDashboard
          buildingId={selectedBuildingId}
          onClose={closeBuildingDashboard}
        />
      )}
    </div>
  );
}
