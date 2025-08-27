import { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Line, Transformer } from "react-konva";
import BuildingBlock from "./building-block";
import { ElectricalSymbols } from "./electrical-symbols";
import DraggableComponent from "./draggable-component";
import { ComponentDataConfig } from "./component-data-config";
import ResizableBarra from "./resizable-barra";
import DynamicDashboard from "./dynamic-dashboard";
import { Button } from "@/components/ui/button";
import { MousePointer, Move, Link, ZoomIn, ZoomOut, Maximize2, Minimize2, Trash2, X, Edit3, Lock, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useResponsiveCanvas } from "@/hooks/use-responsive-canvas";
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tool, setTool] = useState<"select" | "move" | "connect" | "edit" | "lock">("select");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [droppedComponents, setDroppedComponents] = useState<DraggableItem[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<null | { id: string; value: string; left: number; top: number; width: number; height: number }>(null);

  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Hook responsivo para dimensiones automáticas
  const canvasDimensions = useResponsiveCanvas(containerRef);

  // Atajos de teclado para tamaño de componentes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Plus: Aumentar tamaño de todos los componentes
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        if (!isLocked && droppedComponents.some(c => c.type !== "barras")) {
          handleIncreaseAllComponentsSize();
        }
      }
      // Ctrl/Cmd + Minus: Reducir tamaño de todos los componentes
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        if (!isLocked && droppedComponents.some(c => c.type !== "barras")) {
          handleDecreaseAllComponentsSize();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, droppedComponents]);

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
        type: data.componentId === "busbar" ? "barras" : data.componentId, // Mapear busbar a barras
        symbol: data.componentId, // Guardar solo el id/tipo
        name: data.componentName,
        label: data.componentName,
        x: x - 25, // Center the component
        y: y - 25,
        width: (data.componentId === "busbar" || data.componentId === "barras") ? 60 : 50, // Tamaño inicial para componentes
        height: (data.componentId === "busbar" || data.componentId === "barras") ? 15 : 50 // Tamaño inicial para componentes
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

  // Función para calcular el punto de conexión más cercano en una barra
  const getClosestBarConnectionPoint = (barComponent: DraggableItem, targetX: number, targetY: number, isSource: boolean = false) => {
    const barWidth = barComponent.width || 60;
    const barHeight = barComponent.height || 10;
    const barY = barComponent.y;
    const barX = barComponent.x;
    // Puntos de conexión en la parte inferior de la barra
    const numPoints = Math.max(3, Math.floor(barWidth / 15)); // Mínimo 3 puntos, uno cada 15px
    const spacing = barWidth / (numPoints - 1);
    let closestX = barX - barWidth/2;
    let minDistance = Infinity;
    for (let i = 0; i < numPoints; i++) {
      const pointX = barX - barWidth/2 + i * spacing;
      const distance = Math.abs(pointX - targetX);
      if (distance < minDistance) {
        minDistance = distance;
        closestX = pointX;
      }
    }
    // y: parte inferior de la barra
    return {
      x: closestX,
      y: barY + barHeight/2 + 6 // 6px debajo de la barra
    };
  };

  const updateConnectionsForComponents = (components: DraggableItem[]) => {
    setConnections(prev => prev.map(connection => {
      const fromComponent = components.find(c => c.id === connection.from);
      const toComponent = components.find(c => c.id === connection.to);
      
      if (fromComponent && toComponent) {
        let fromConnectionX, fromConnectionY, toConnectionX, toConnectionY;
        
        if (fromComponent.type === "barras") {
          // Para barras: calcular el punto de conexión más cercano al destino
          const targetX = toComponent.type === "barras" 
            ? toComponent.x + (toComponent.width || 60) / 2 
            : toComponent.x;
          const targetY = toComponent.type === "barras" 
            ? toComponent.y + (toComponent.height || 10) / 2 
            : toComponent.y - 10;
            
          const connectionPoint = getClosestBarConnectionPoint(fromComponent, targetX, targetY, true);
          fromConnectionX = connectionPoint.x;
          fromConnectionY = connectionPoint.y;
        } else {
          // Para otros componentes: usar la parte superior central del símbolo
          fromConnectionX = fromComponent.x;
          fromConnectionY = fromComponent.y - (fromComponent.height || 50) / 4; // Parte superior del símbolo escalado
        }
        
        if (toComponent.type === "barras") {
          // Para barras: calcular el punto de conexión más cercano al origen
          const sourceX = fromComponent.type === "barras" 
            ? fromConnectionX 
            : fromComponent.x;
          const sourceY = fromComponent.type === "barras" 
            ? fromConnectionY 
            : fromComponent.y - (fromComponent.height || 50) / 4;
            
          const connectionPoint = getClosestBarConnectionPoint(toComponent, sourceX, sourceY, false);
          toConnectionX = connectionPoint.x;
          toConnectionY = connectionPoint.y;
        } else {
          // Para otros componentes: usar la parte superior central del símbolo
          toConnectionX = toComponent.x;
          toConnectionY = toComponent.y - (toComponent.height || 50) / 4; // Parte superior del símbolo escalado
        }
        
        // Create 90-degree angle routing between connection points
        const points = create90DegreeRoute(fromConnectionX, fromConnectionY, toConnectionX, toConnectionY);
        
        return {
          ...connection,
          points
        };
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
    // Find the component to get its position and size
    const comp = droppedComponents.find(c => c.id === id);
    if (comp) {
      setEditingLabel({
        id,
        value: currentLabel,
        left: comp.x - (comp.width || 50) / 2,
        top: comp.y + (comp.height || 50) / 2 + 8,
        width: (comp.width || 50) + 20,
        height: 28
      });
    }
  };

  const handleComponentResize = (id: string, width: number, height: number) => {
    setDroppedComponents(prev => 
      prev.map(comp => comp.id === id ? { ...comp, width, height } : comp)
    );
  };

  const handleIncreaseComponentSize = () => {
    if (selectedComponent) {
      const component = droppedComponents.find(c => c.id === selectedComponent);
      if (component) {
        // Permitir estiramiento horizontal para barras
        const isBarra = component.type === "barras" || component.type === "barra_colectora";
        const maxWidth = isBarra ? 300 : 100;
        const maxHeight = isBarra ? 30 : 100;
        const newWidth = Math.min((component.width || 60) + 20, maxWidth);
        const newHeight = isBarra ? (component.height || 15) : Math.min((component.height || 50) + 10, maxHeight);
        handleComponentResize(selectedComponent, newWidth, newHeight);
      }
    }
  };

  const handleDecreaseComponentSize = () => {
    if (selectedComponent) {
      const component = droppedComponents.find(c => c.id === selectedComponent);
      if (component) {
        // Permitir reducción horizontal para barras
        const isBarra = component.type === "barras" || component.type === "barra_colectora";
        const minWidth = isBarra ? 40 : 20;
        const minHeight = isBarra ? 8 : 20;
        const newWidth = Math.max((component.width || 60) - 20, minWidth);
        const newHeight = isBarra ? (component.height || 15) : Math.max((component.height || 50) - 10, minHeight);
        handleComponentResize(selectedComponent, newWidth, newHeight);
      }
    }
  };

  const handleIncreaseAllComponentsSize = () => {
    setDroppedComponents(prev => 
      prev.map(comp => {
        if (comp.type !== "barras") {
          const newWidth = Math.min((comp.width || 50) + 10, 120);
          const newHeight = Math.min((comp.height || 50) + 10, 120);
          return { ...comp, width: newWidth, height: newHeight };
        }
        return comp;
      })
    );
    
    // Actualizar conexiones después del cambio de tamaño
    setTimeout(() => updateConnectionsForComponents(droppedComponents), 100);
    
    toast({
      title: "Tamaño aumentado",
      description: "Todos los componentes han sido aumentados de tamaño",
    });
  };

  const handleDecreaseAllComponentsSize = () => {
    setDroppedComponents(prev => 
      prev.map(comp => {
        if (comp.type !== "barras") {
          const newWidth = Math.max((comp.width || 50) - 10, 20);
          const newHeight = Math.max((comp.height || 50) - 10, 20);
          return { ...comp, width: newWidth, height: newHeight };
        }
        return comp;
      })
    );
    
    // Actualizar conexiones después del cambio de tamaño
    setTimeout(() => updateConnectionsForComponents(droppedComponents), 100);
    
    toast({
      title: "Tamaño reducido",
      description: "Todos los componentes han sido reducidos de tamaño",
    });
  };

  // Función para verificar si un componente está conectado
  const isComponentConnected = (componentId: string): boolean => {
    return connections.some((conn: Connection) => conn.from === componentId || conn.to === componentId);
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
          // Calcular puntos de conexión correctos
          let fromX, fromY, toX, toY;
          
          if (fromComponent.type === "barras") {
            // Para barras: calcular el punto de conexión más cercano al destino
            const targetX = toComponent.type === "barras" 
              ? toComponent.x + (toComponent.width || 60) / 2 
              : toComponent.x;
            const targetY = toComponent.type === "barras" 
              ? toComponent.y + (toComponent.height || 10) / 2 
              : toComponent.y - (toComponent.height || 50) / 4;
              
            const connectionPoint = getClosestBarConnectionPoint(fromComponent, targetX, targetY, true);
            fromX = connectionPoint.x;
            fromY = connectionPoint.y;
          } else {
            // Para otros componentes: usar la parte superior central del símbolo
            fromX = fromComponent.x;
            fromY = fromComponent.y - (fromComponent.height || 50) / 4; // Parte superior del símbolo escalado
          }
          
          if (toComponent.type === "barras") {
            // Para barras: calcular el punto de conexión más cercano al origen
            const sourceX = fromComponent.type === "barras" 
              ? fromX 
              : fromComponent.x;
            const sourceY = fromComponent.type === "barras" 
              ? fromY 
              : fromComponent.y - (fromComponent.height || 50) / 4;
              
            const connectionPoint = getClosestBarConnectionPoint(toComponent, sourceX, sourceY, false);
            toX = connectionPoint.x;
            toY = connectionPoint.y;
          } else {
            // Para otros componentes: usar la parte superior central del símbolo
            toX = toComponent.x;
            toY = toComponent.y - (toComponent.height || 50) / 4; // Parte superior del símbolo escalado
          }
          
          const newConnection: Connection = {
            id: `connection-${Date.now()}`,
            from: connectingFrom,
            to: componentId,
            points: create90DegreeRoute(fromX, fromY, toX, toY)
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

  // Doble clic: si es sobre el label, activar edición; si es sobre el símbolo, abrir dashboard
  const handleComponentDoubleClick = (componentId: string, componentType: string, target?: string) => {
    if (target === 'label') {
      // Buscar el componente y su label actual
      const comp = droppedComponents.find(c => c.id === componentId);
      if (comp) {
        setEditingLabel({
          id: componentId,
          value: comp.label || comp.name,
          left: comp.x - (comp.width || 50) / 2,
          top: comp.y + (comp.height || 50) / 2 + 8,
          width: (comp.width || 50) + 20,
          height: 28
        });
      }
    } else {
      // Por defecto, abrir dashboard
      setShowDashboard(componentId);
      toast({
        title: "Dashboard abierto",
        description: `Mostrando dashboard para ${droppedComponents.find(c => c.id === componentId)?.label || componentType}`,
      });
    }
  };

  return (
    <div className={`flex-1 flex flex-col bg-gray-100 relative${isFullscreen ? ' fixed inset-0 z-50 bg-black' : ''}`}> 
      {/* Canvas Toolbar */}
      {!isFullscreen && (
        <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1 sm:space-x-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              variant={tool === "select" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTool("select")}
              title="Seleccionar"
              disabled={isLocked}
            >
              <MousePointer className="w-4 h-4" />
              <span className="hidden lg:inline ml-1">Seleccionar</span>
            </Button>
            <Button
              variant={tool === "move" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTool("move")}
              title="Mover"
              disabled={isLocked}
            >
              <Move className="w-4 h-4" />
              <span className="hidden lg:inline ml-1">Mover</span>
            </Button>
            <Button
              variant={tool === "connect" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTool("connect")}
              title="Conectar"
              disabled={isLocked}
            >
              <Link className="w-4 h-4" />
              <span className="hidden lg:inline ml-1">Conectar</span>
            </Button>
            <Button
              variant={tool === "edit" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setTool("edit");
                setIsLocked(false);
              }}
              title="Modo Edición"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden lg:inline ml-1">Editar</span>
            </Button>
            <Button
              variant={isLocked ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setIsLocked(!isLocked);
                if (!isLocked) {
                  setTool("lock");
                  setSelectedComponent(null);
                  toast({
                    title: "Diagrama bloqueado",
                    description: "Los componentes no se pueden mover ni editar",
                  });
                } else {
                  setTool("select");
                  toast({
                    title: "Diagrama desbloqueado",
                    description: "Los componentes se pueden mover y editar normalmente",
                  });
                }
              }}
              title={isLocked ? "Desbloquear" : "Bloquear"}
            >
              <Lock className="w-4 h-4" />
            </Button>
            {/* Botón de pantalla completa */}
            <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(true)} title="Pantalla Completa">
              <Maximize2 className="w-4 h-4" />
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
          
          {/* Component Size Controls */}
          {selectedComponent && droppedComponents.find(c => c.id === selectedComponent)?.type !== "barras" && (
            <>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Tamaño:</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDecreaseComponentSize}
                  title="Reducir Tamaño"
                  disabled={isLocked}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-xs text-gray-500 min-w-[40px] text-center">
                  {droppedComponents.find(c => c.id === selectedComponent)?.width || 50}×{droppedComponents.find(c => c.id === selectedComponent)?.height || 50}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleIncreaseComponentSize}
                  title="Aumentar Tamaño"
                  disabled={isLocked}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
          
          {/* Global Component Size Controls */}
          {droppedComponents.some(c => c.type !== "barras") && (
            <>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Todos:</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDecreaseAllComponentsSize}
                  title="Reducir Tamaño de Todos los Componentes (Ctrl+-)"
                  disabled={isLocked || droppedComponents.length === 0}
                >
                  <Minus className="w-4 h-4" />
                  <span className="hidden lg:inline ml-1">Reducir</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleIncreaseAllComponentsSize}
                  title="Aumentar Tamaño de Todos los Componentes (Ctrl++)"
                  disabled={isLocked || droppedComponents.length === 0}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden lg:inline ml-1">Aumentar</span>
                </Button>
              </div>
            </>
          )}
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
      )}
      {/* Botón para salir de pantalla completa */}
      {isFullscreen && (
        <button
          className="absolute top-4 right-4 z-50 bg-white rounded-full shadow p-2 border border-gray-300 hover:bg-gray-100 transition"
          onClick={() => setIsFullscreen(false)}
          title="Salir de Pantalla Completa"
        >
          <Minimize2 className="w-6 h-6 text-gray-700" />
        </button>
      )}

      {/* Main Diagram Canvas */}
      <div 
        ref={containerRef}
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
        <div className="absolute top-4 left-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 z-10">
          <div className="flex items-center space-x-2">
            <span>📋</span>
            <span className="hidden sm:inline">Arrastra símbolos aquí para construir tu diagrama unifilar</span>
            <span className="sm:hidden">Arrastra símbolos aquí</span>
          </div>
        </div>
        
        {/* Component count indicator */}
        {droppedComponents.length > 0 && (
          <div className="absolute top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-2 text-sm text-green-700 z-10">
            <span className="hidden sm:inline">{droppedComponents.length} componente{droppedComponents.length !== 1 ? 's' : ''} en el diagrama</span>
            <span className="sm:hidden">{droppedComponents.length} comp.</span>
          </div>
        )}
        
        {/* Konva Stage for electrical diagram */}
        <Stage
          ref={stageRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          scaleX={zoomLevel / 100}
          scaleY={zoomLevel / 100}
          draggable={tool === "move"}
          onClick={(e) => {
            // Click en área vacía deselecciona
            if (e.target === e.target.getStage()) {
              setSelectedComponent(null);
              if (tool === "connect") {
                setConnectingFrom(null);
              }
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
                strokeWidth={4} // Líneas más gruesas
                lineCap="square"
                lineJoin="miter"
                tension={0}
                onClick={(e) => {
                  e.evt.stopPropagation();
                  if (tool === "select") {
                    // Mostrar opción de eliminar conexión
                    const confirmDelete = window.confirm("¿Eliminar esta conexión?");
                    if (confirmDelete) {
                      setConnections(prev => prev.filter(conn => conn.id !== connection.id));
                      toast({
                        title: "Conexión eliminada",
                        description: "La conexión ha sido eliminada del diagrama",
                      });
                    }
                  }
                }}
                onTap={(e) => {
                  e.evt.stopPropagation();
                  if (tool === "select") {
                    // Mostrar opción de eliminar conexión en dispositivos táctiles
                    const confirmDelete = window.confirm("¿Eliminar esta conexión?");
                    if (confirmDelete) {
                      setConnections(prev => prev.filter(conn => conn.id !== connection.id));
                      toast({
                        title: "Conexión eliminada",
                        description: "La conexión ha sido eliminada del diagrama",
                      });
                    }
                  }
                }}
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
                  width={component.width || 60} // Ancho por defecto más pequeño
                  height={component.height || 10} // Altura por defecto más pequeña
                  isSelected={!isLocked && (selectedComponent === component.id || connectingFrom === component.id)}
                  isDragEnabled={tool === "move"}
                  onSelect={() => {
                    if (!isLocked) {
                      setSelectedComponent(component.id);
                      handleComponentClick(component.id, component.type);
                    }
                  }}
                  onDragEnd={(x, y) => {
                    if (!isLocked) {
                      handleComponentDragEnd(component.id, x, y);
                    }
                  }}
                  onResize={(width, height) => {
                    if (!isLocked) {
                      handleComponentResize(component.id, width, height);
                    }
                  }}
                  onDelete={() => {
                    if (!isLocked) {
                      handleComponentDelete(component.id);
                    }
                  }}
                  onLabelUpdate={(label) => {
                    if (!isLocked) {
                      handleComponentLabelUpdate(component.id, label);
                    }
                  }}
                  onStartEditing={(label) => {
                    if (!isLocked) {
                      handleStartEditingLabel(component.id, label);
                    }
                  }}
                  isLocked={isLocked}
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
                  width={component.width || 50}
                  height={component.height || 50}
                  isSelected={!isLocked && (selectedComponent === component.id || connectingFrom === component.id)}
                  isDragEnabled={tool === "move"}
                  isConnected={isComponentConnected(component.id)}
                  onSelect={() => {
                    if (!isLocked) {
                      setSelectedComponent(component.id);
                      handleComponentClick(component.id, component.type);
                    }
                  }}
                  onDragEnd={(x, y) => {
                    if (!isLocked) {
                      handleComponentDragEnd(component.id, x, y);
                    }
                  }}
                  onResize={(width, height) => {
                    if (!isLocked) {
                      handleComponentResize(component.id, width, height);
                    }
                  }}
                  onDelete={() => {
                    if (!isLocked) {
                      handleComponentDelete(component.id);
                    }
                  }}
                  onLabelUpdate={(label) => {
                    if (!isLocked) {
                      handleComponentLabelUpdate(component.id, label);
                    }
                  }}
                  onStartEditing={(label) => {
                    if (!isLocked) {
                      handleStartEditingLabel(component.id, label);
                    }
                  }}
                  onClick={() => {
                    if (!isLocked) {
                      handleComponentClick(component.id, component.type);
                    }
                  }}
                  // Doble clic sobre el símbolo abre dashboard, sobre el label activa edición
                  onDoubleClick={e => {
                    if (e && e.target && e.target.className && typeof e.target.className === 'string' && e.target.className.includes('component-label')) {
                      handleComponentDoubleClick(component.id, component.type, 'label');
                    } else {
                      handleComponentDoubleClick(component.id, component.type);
                    }
                  }}
                  isLocked={isLocked}
                  onRename={(id, newName) => {
                    setDroppedComponents(prev => prev.map(comp => comp.id === id ? { ...comp, label: newName } : comp));
                  }}
                />
              )
            ))}
          </Layer>
        </Stage>
      </div>
      
      {/* Dashboard Modal */}
      {showDashboard && (() => {
        const comp = droppedComponents.find(c => c.id === showDashboard);
        if (!comp) return null;
        
        return (
          <DynamicDashboard
            componentId={comp.id}
            onClose={() => setShowDashboard(null)}
          />
        );
      })()}

      {/* Edición de nombre superpuesta sobre el canvas */}
      {editingLabel && (
        <input
          style={{
            position: 'absolute',
            left: editingLabel.left * (zoomLevel / 100),
            top: editingLabel.top * (zoomLevel / 100),
            width: editingLabel.width * (zoomLevel / 100),
            height: editingLabel.height,
            fontSize: 16,
            fontWeight: 'bold',
            zIndex: 100,
            background: '#fff',
            border: '1px solid #D1D5DB',
            borderRadius: 4,
            padding: '2px 6px',
          }}
          value={editingLabel.value}
          onChange={e => setEditingLabel({ ...editingLabel, value: e.target.value })}
          onBlur={() => {
            setDroppedComponents(prev => prev.map(comp => comp.id === editingLabel.id ? { ...comp, label: editingLabel.value } : comp));
            setEditingLabel(null);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              setDroppedComponents(prev => prev.map(comp => comp.id === editingLabel.id ? { ...comp, label: editingLabel.value } : comp));
              setEditingLabel(null);
            } else if (e.key === 'Escape') {
              setEditingLabel(null);
            }
          }}
          autoFocus
        />
      )}
    </div>
  );
}
