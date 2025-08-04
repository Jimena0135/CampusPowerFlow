import { useRef, useEffect, useState } from "react";
import { Stage, Layer } from "react-konva";
import BuildingBlock from "./building-block";
import { ElectricalSymbols } from "./electrical-symbols";
import { Button } from "@/components/ui/button";
import { MousePointer, Move, Link, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { Building } from "@shared/schema";

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
  const stageRef = useRef<any>(null);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 400));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 25));
  };

  const handleFitToWindow = () => {
    setZoomLevel(100);
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
      <div className="flex-1 relative overflow-hidden">
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
        
        {/* Konva Stage for electrical diagram */}
        <Stage
          ref={stageRef}
          width={window.innerWidth}
          height={window.innerHeight - 120} // Account for header and toolbar
          scaleX={zoomLevel / 100}
          scaleY={zoomLevel / 100}
          draggable={tool === "move"}
        >
          <Layer>
            {/* Main Electrical Feed Components */}
            <ElectricalSymbols x={80} y={80} />
            
            {/* Building Blocks */}
            {buildings.map((building, index) => (
              <BuildingBlock
                key={building.id}
                building={building}
                x={building.positionX || 240 + (index * 320)}
                y={building.positionY || 240}
                onClick={() => onBuildingClick(building.id)}
                isRealTimeActive={isRealTimeActive}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
