import { useRef, useEffect, useState } from "react";
import { Stage, Layer, Line, Transformer } from "react-konva";
import BuildingBlock from "./building-block";
import { ElectricalSymbols } from "./electrical-symbols";
import DraggableComponent from "./draggable-component";
import ResizableBarra from "./resizable-barra";
import CargaDashboard from "./carga-dashboard";
import { Button } from "@/components/ui/button";
import { MousePointer, Move, Link, ZoomIn, ZoomOut, Maximize2, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Building } from "@shared/schema";

interface DraggableItem {
  id: string;
  type: string;
  symbol: string;
  name: string;
  label?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  points: number[];
  waypoints?: { x: number; y: number }[]; // For 90-degree routing
}

interface DiagramCanvasProps {
  buildings: Building[];
  onBuildingClick: (buildingId: string) => void;
  isRealTimeActive: boolean;
}

export default function DiagramCanvas({ buildings, onBuildingClick, isRealTimeActive }: DiagramCanvasProps) {
  const [tool, setTool] = useState<"select" | "move" | "connect">("select");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [droppedComponents, setDroppedComponents] = useState<DraggableItem[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState<string | null>(null);
  const [editingComponent, setEditingComponent] = useState<{ id: string; label: string } | null>(null);
  const stageRef = useRef<any>(null);
  const { toast } = useToast();

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 400));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 25));
  };

  const handleFitToWindow = () => {
    setZoomLevel(100);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    
    if (data.type === 'component') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / (zoomLevel / 100);
      const y = (e.clientY - rect.top) / (zoomLevel / 100);
      
      const newComponent: DraggableItem = {
        id: `component-${Date.now()}`,
        type: data.componentId,
        symbol: data.componentSymbol,
        name: data.componentName,
        label: data.componentName,
        x: x - 25, // Center the component
        y: y - 25,
        width: data.componentId === "barras" ? 80 : undefined,
        height: data.componentId === "barras" ? 20 : undefined
      };
      
      setDroppedComponents(prev => [...prev, newComponent]);
      toast({
        title: "Componente agregado",
        description: `${data.componentName} agregado al diagrama`,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleComponentDragEnd = (id: string, x: number, y: number) => {
    setDroppedComponents(prev => {
      const updated = prev.map(comp => comp.id === id ? { ...comp, x, y } : comp);
      setTimeout(() => updateConnectionsForComponents(updated), 100);
      return updated;
    });
  };

  const create90DegreeRoute = (fromX: number, fromY: number, toX: number, toY: number) => {
    // Create completely straight lines with 90-degree angles
    const midX = fromX + (toX - fromX) * 0.5;
    return [fromX, fromY, midX, fromY, midX, toY, toX, toY];
  };

  const updateConnectionsForComponents = (components: DraggableItem[]) => {
    setConnections(prev => prev.map(connection => {
      const fromComponent = components.find(c => c.id === connection.from);
      const toComponent = components.find(c => c.id === connection.to);
      
      if (fromComponent && toComponent) {
        const fromCenterX = fromComponent.x + (fromComponent.width ? fromComponent.width / 2 : 25);
        const fromCenterY = fromComponent.y + (fromComponent.height ? fromComponent.height / 2 : 25);
        const toCenterX = toComponent.x + (toComponent.width ? toComponent.width / 2 : 25);
        const toCenterY = toComponent.y + (toComponent.height ? toComponent.height / 2 : 25);
        
        // Calculate connection points at component edges for straight lines
        const dx = toCenterX - fromCenterX;
        const dy = toCenterY - fromCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          // Use center points for cleaner connections
          const fromConnectionX = fromCenterX;
          const fromConnectionY = fromCenterY;
          const toConnectionX = toCenterX;
          const toConnectionY = toCenterY;
          
          // Create 90-degree angle routing from center to center
          const points = create90DegreeRoute(fromConnectionX, fromConnectionY, toConnectionX, toConnectionY);
          
          return {
            ...connection,
            points
          };
        }
      }
      return connection;
    }));
  };



  const handleComponentDelete = (id: string) => {
    setDroppedComponents(prev => prev.filter(comp => comp.id !== id));
    setSelectedComponent(null);
    toast({
      title: "Componente eliminado",
      description: "El componente ha sido eliminado del diagrama",
    });
  };

  const handleComponentLabelUpdate = (id: string, label: string) => {
    setDroppedComponents(prev => 
      prev.map(comp => comp.id === id ? { ...comp, label } : comp)
    );
    setEditingComponent(null);
  };

  const handleStartEditingLabel = (id: string, currentLabel: string) => {
    setEditingComponent({ id, label: currentLabel });
  };

  const handleComponentResize = (id: string, width: number, height: number) => {
    setDroppedComponents(prev => 
      prev.map(comp => comp.id === id ? { ...comp, width, height } : comp)
    );
  };

  const clearAllComponents = () => {
    setDroppedComponents([]);
    setConnections([]);
    setSelectedComponent(null);
    setConnectingFrom(null);
    setShowDashboard(null);
    toast({
      title: "Diagrama limpiado",
      description: "Todos los componentes han sido eliminados",
    });
  };

  const handleComponentClick = (componentId: string, componentType: string) => {
    if (tool === "connect") {
      if (connectingFrom === null) {
        setConnectingFrom(componentId);
        toast({
          title: "Modo conexión",
          description: "Selecciona el componente de destino para crear la conexión",
        });
      } else if (connectingFrom !== componentId) {
        // Create connection
        const fromComponent = droppedComponents.find(c => c.id === connectingFrom);
        const toComponent = droppedComponents.find(c => c.id === componentId);
        
        if (fromComponent && toComponent) {
          const newConnection: Connection = {
            id: `connection-${Date.now()}`,
            from: connectingFrom,
            to: componentId,
            points: [
              fromComponent.x + 25, fromComponent.y + 25,
              toComponent.x + 25, toComponent.y + 25
            ]
          };
          
          setConnections(prev => [...prev, newConnection]);
          setConnectingFrom(null);
          toast({
            title: "Conexión creada",
            description: `Conectado ${fromComponent.label} con ${toComponent.label}`,
          });
          setTimeout(() => updateConnectionsForComponents(droppedComponents), 100);
        }
      }
    } else if (componentType === "carga") {
      // Single click selection for loads
      setSelectedComponent(componentId);
    }
  };

  const handleComponentDoubleClick = (componentId: string, componentType: string) => {
    console.log('Double click detected:', componentId, componentType); // Debug log
    if (componentType === "carga" || componentType === "load") {
      setShowDashboard(componentId);
      toast({
        title: "Dashboard abierto",
        description: `Mostrando dashboard para ${droppedComponents.find(c => c.id === componentId)?.label || "Carga"}`,
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100 relative">
      {/* Canvas Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={tool === "select" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTool("select")}
              title="Seleccionar"
            >
              <MousePointer className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === "move" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTool("move")}
              title="Mover"
            >
              <Move className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === "connect" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTool("connect")}
              title="Conectar"
            >
              <Link className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="w-px h-6 bg-gray-300"></div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600 font-mono min-w-[50px] text-center">{zoomLevel}%</span>
            <Button variant="ghost" size="sm" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleFitToWindow} title="Ajustar a Ventana">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllComponents}
            title="Limpiar Diagrama"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Limpiar
          </Button>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">Grid:</span>
            <Button
              variant={gridEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setGridEnabled(!gridEnabled)}
              className="px-2 py-1 text-xs"
            >
              {gridEnabled ? "ON" : "OFF"}
            </Button>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">Snap:</span>
            <Button
              variant={snapEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setSnapEnabled(!snapEnabled)}
              className="px-2 py-1 text-xs"
            >
              {snapEnabled ? "ON" : "OFF"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Diagram Canvas */}
      <div 
        className="flex-1 relative overflow-hidden"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Grid Background */}
        {gridEnabled && (
          <div 
            className="absolute inset-0 opacity-30" 
            style={{
              backgroundImage: "radial-gradient(circle, #ccc 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }}
          />
        )}
        
        {/* Drop zone indicator */}
        <div className="absolute top-4 left-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          <div className="flex items-center space-x-2">
            <span>📋</span>
            <span>Arrastra símbolos aquí para construir tu diagrama unifilar</span>
          </div>
        </div>
        
        {/* Component count indicator */}
        {droppedComponents.length > 0 && (
          <div className="absolute top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-2 text-sm text-green-700">
            {droppedComponents.length} componente{droppedComponents.length !== 1 ? 's' : ''} en el diagrama
          </div>
        )}
        
        {/* Konva Stage for electrical diagram */}
        <Stage
          ref={stageRef}
          width={window.innerWidth}
          height={window.innerHeight - 120} // Account for header and toolbar
          scaleX={zoomLevel / 100}
          scaleY={zoomLevel / 100}
          draggable={tool === "move"}
          onClick={(e) => {
            // Only deselect if clicking on empty canvas
            if (e.target === e.target.getStage()) {
              setSelectedComponent(null);
            }
          }}
        >
          <Layer>
            {/* Connections */}
            {connections.map((connection) => (
              <Line
                key={connection.id}
                points={connection.points}
                stroke="#374151"
                strokeWidth={2}
                lineCap="square"
                lineJoin="miter"
                tension={0}
              />
            ))}
            
            {/* Draggable Components */}
            {droppedComponents.map((component) => (
              component.type === "barras" ? (
                <ResizableBarra
                  key={component.id}
                  id={component.id}
                  symbol={component.symbol}
                  name={component.name}
                  label={component.label}
                  x={component.x}
                  y={component.y}
                  width={component.width || 80}
                  height={component.height || 20}
                  isSelected={selectedComponent === component.id || connectingFrom === component.id}
                  onSelect={() => {
                    setSelectedComponent(component.id);
                    handleComponentClick(component.id, component.type);
                  }}
                  onDragEnd={(x, y) => handleComponentDragEnd(component.id, x, y)}
                  onResize={(width, height) => handleComponentResize(component.id, width, height)}
                  onDelete={() => handleComponentDelete(component.id)}
                  onLabelUpdate={(label) => handleComponentLabelUpdate(component.id, label)}
                  onStartEditing={(label) => handleStartEditingLabel(component.id, label)}
                />
              ) : (
                <DraggableComponent
                  key={component.id}
                  id={component.id}
                  type={component.type}
                  symbol={component.symbol}
                  name={component.name}
                  label={component.label}
                  x={component.x}
                  y={component.y}
                  isSelected={selectedComponent === component.id || connectingFrom === component.id}
                  onSelect={() => {
                    setSelectedComponent(component.id);
                    handleComponentClick(component.id, component.type);
                  }}
                  onDragEnd={(x, y) => handleComponentDragEnd(component.id, x, y)}
                  onDelete={() => handleComponentDelete(component.id)}
                  onLabelUpdate={(label) => handleComponentLabelUpdate(component.id, label)}
                  onStartEditing={(label) => handleStartEditingLabel(component.id, label)}
                  onClick={() => handleComponentClick(component.id, component.type)}
                  onDoubleClick={() => handleComponentDoubleClick(component.id, component.type)}
                />
              )
            ))}
          </Layer>
        </Stage>
      </div>
      
      {/* Dashboard Modal */}
      {showDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[900px] h-[700px] relative overflow-y-auto">
            <button
              onClick={() => setShowDashboard(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <CargaDashboard 
              cargaId={showDashboard}
              cargaName={droppedComponents.find(c => c.id === showDashboard)?.label || "Carga"}
              onClose={() => setShowDashboard(null)}
            />
          </div>
        </div>
      )}

      {/* Label Editing Modal */}
      {editingComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">Editar Etiqueta</h3>
            <input
              value={editingComponent.label}
              onChange={(e) => setEditingComponent({ ...editingComponent, label: e.target.value })}
              placeholder="Ingrese la etiqueta del componente"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleComponentLabelUpdate(editingComponent.id, editingComponent.label);
                } else if (e.key === 'Escape') {
                  setEditingComponent(null);
                }
              }}
            />
            <div className="flex space-x-2">
              <button 
                onClick={() => handleComponentLabelUpdate(editingComponent.id, editingComponent.label)} 
                className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                Guardar
              </button>
              <button 
                onClick={() => setEditingComponent(null)} 
                className="flex-1 bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
