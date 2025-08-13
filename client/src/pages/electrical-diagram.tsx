import { useState } from "react";
import DiagramCanvas from "@/components/diagram-canvas";
import ComponentLibrary from "@/components/component-library";
import SystemStatus from "@/components/system-status";
import BuildingDashboard from "@/components/building-dashboard";
import { useWebSocket } from "@/hooks/use-websocket";
import { useElectricalData } from "@/hooks/use-electrical-data";
import { useResizable } from "@/hooks/use-resizable";
import { Play, Pause, Save, Settings, HelpCircle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ElectricalDiagram() {
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);

  // Hooks para redimensionamiento
  const leftPanel = useResizable({
    initialWidth: 320,
    minWidth: 240,
    maxWidth: 500,
    direction: 'left',
    storageKey: 'unifilar-left-panel-width'
  });

  const rightPanel = useResizable({
    initialWidth: 320,
    minWidth: 200,
    maxWidth: 600,
    direction: 'right',
    storageKey: 'unifilar-right-panel-width'
  });

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
      {/* Header/Toolbar - Responsivo */}
      <header className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Botón menú móvil */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="text-xl text-blue-600">⚡</div>
            <h1 className="text-sm sm:text-xl font-semibold text-gray-800">
              <span className="hidden sm:inline">Diagrama Unifilar Eléctrico</span>
              <span className="sm:hidden">Unifilar</span>
            </h1>
            <span className="hidden md:inline text-sm text-gray-500">| Universidad Pontificia Bolivariana</span>
          </div>
          
          <div className="hidden sm:flex items-center space-x-2 ml-8">
            <Button
              onClick={() => setIsRealTimeActive(!isRealTimeActive)}
              className={`px-3 py-1.5 text-sm ${
                isRealTimeActive 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {isRealTimeActive ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
              <span className="hidden md:inline">{isRealTimeActive ? "Tiempo Real" : "Pausar"}</span>
            </Button>
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Save className="w-4 h-4 mr-1" />
              Guardar
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="hidden sm:inline text-gray-600">{isConnected ? "Conectado" : "Desconectado"}</span>
            <span className="hidden md:inline text-gray-400">|</span>
            <span className="hidden md:inline text-gray-600">Última: <span className="font-mono">{lastUpdate}</span></span>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button variant="ghost" size="sm" title="Ayuda" className="hidden sm:flex">
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Component Library */}
        <div 
          className={`
            ${mobileMenuOpen ? 'absolute inset-y-0 left-0 z-50 bg-white shadow-lg' : 'hidden'}
            lg:block lg:relative lg:z-auto lg:shadow-none
            flex-shrink-0 transition-all duration-300 relative
          `}
          style={{ 
            width: leftPanelOpen ? `${leftPanel.width}px` : '48px' 
          }}
        >
          <ComponentLibrary 
            isOpen={leftPanelOpen}
            onToggle={() => setLeftPanelOpen(!leftPanelOpen)}
          />
          
          {/* Resizer para panel izquierdo - solo mostrar cuando está expandido */}
          {leftPanelOpen && (
            <div
              className={`resizer resizer-vertical resizer-right ${leftPanel.isResizing ? 'resizing' : ''}`}
              onMouseDown={leftPanel.handleMouseDown}
              onDoubleClick={leftPanel.handleDoubleClick}
              title="Arrastrar para redimensionar | Doble click para restaurar tamaño"
            />
          )}
          
          {/* Overlay para cerrar menú móvil */}
          {mobileMenuOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 -z-10"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 min-w-0 relative">
          <DiagramCanvas 
            buildings={buildings || []} 
            onBuildingClick={handleBuildingClick}
            isRealTimeActive={isRealTimeActive}
          />
        </div>

        {/* Right Sidebar - System Status */}
        <div 
          className={`
            flex-shrink-0 border-l border-gray-200 transition-all duration-300 relative
          `}
          style={{ 
            width: rightPanelOpen ? `${rightPanel.width}px` : '48px' 
          }}
        >
          <SystemStatus 
            buildings={buildings || []} 
            isOpen={rightPanelOpen}
            onToggle={() => setRightPanelOpen(!rightPanelOpen)}
          />
          
          {/* Resizer para panel derecho */}
          {rightPanelOpen && (
            <div
              className={`resizer resizer-vertical resizer-left ${rightPanel.isResizing ? 'resizing' : ''}`}
              onMouseDown={rightPanel.handleMouseDown}
              onDoubleClick={rightPanel.handleDoubleClick}
              title="Arrastrar para redimensionar | Doble click para restaurar tamaño"
            />
          )}
        </div>
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
