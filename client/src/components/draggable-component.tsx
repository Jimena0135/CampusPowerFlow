import { useState, useRef } from "react";
import { Group, Rect, Text, Circle } from "react-konva";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Edit3 } from "lucide-react";

interface DraggableComponentProps {
  id: string;
  type: string;
  symbol: string;
  name: string;
  label?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  isSelected: boolean;
  isLocked?: boolean;
  isDragEnabled?: boolean;
  isConnected?: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onResize?: (width: number, height: number) => void;
  onDelete: () => void;
  onLabelUpdate: (label: string) => void;
  onStartEditing: (label: string) => void;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

export default function DraggableComponent({
  id,
  type,
  symbol,
  name,
  label,
  x,
  y,
  width = 50,
  height = 50,
  isSelected,
  isLocked = false,
  isDragEnabled = false,
  isConnected = false,
  onSelect,
  onDragEnd,
  onResize,
  onDelete,
  onLabelUpdate,
  onStartEditing,
  onClick,
  onDoubleClick
}: DraggableComponentProps) {
  const groupRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasBeenDragged, setHasBeenDragged] = useState(false);

  const handleDragStart = (e: any) => {
    if (!isDragEnabled) return;
    setIsDragging(true);
    setHasBeenDragged(false);
  };

  const handleDragMove = (e: any) => {
    if (!isDragEnabled) return;
    if (isDragging) {
      setHasBeenDragged(true);
    }
  };

  const handleDragEnd = (e: any) => {
    if (!isDragEnabled) return;
    setIsDragging(false);
    if (hasBeenDragged) {
      onDragEnd(e.target.x(), e.target.y());
    }
    setHasBeenDragged(false);
  };

  const handleClick = (e: any) => {
    e.evt.stopPropagation();
    // Solo seleccionar si no estamos arrastrando o si no se ha movido el componente
    if (!isDragging && !hasBeenDragged) {
      onSelect();
      if (onClick) {
        onClick();
      }
    }
  };

  const handleDoubleClick = (e: any) => {
    e.evt.stopPropagation();
    console.log('Component double clicked:', type, id);
    if ((type === "carga" || type === "load") && onDoubleClick) {
      onDoubleClick();
    }
  };

  const handleLabelEdit = () => {
    onStartEditing(label || name);
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        draggable={!isLocked && isDragEnabled}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        onDblClick={handleDoubleClick}
        onTap={handleClick}
        onDblTap={handleDoubleClick}
      >
        {/* Background for component - no circle */}
        
        {/* Component symbol */}
        <Text
          x={-width/4}
          y={-height/4}
          text={symbol}
          fontSize={Math.min(width, height) * 0.4}
          fill="#374151"
          align="center"
          fontWeight="bold"
        />
        
        {/* Connection point at center of symbol */}
        <Circle
          x={0}
          y={-height/4} // Parte superior del símbolo escalado
          radius={Math.min(width, height) * 0.06}
          fill={isConnected ? "#10B981" : "#FFD700"} // Verde si está conectado, dorado si no
          stroke={isConnected ? "#059669" : "#B8860B"}
          strokeWidth={1}
        />
        
        {/* Connection point indicator (small circle at center) */}
        <Circle
          x={0}
          y={0}
          radius={Math.min(width, height) * 0.04}
          fill={isConnected ? "#10B981" : "#2563eb"} // Verde si está conectado, azul si no
          opacity={0.6}
        />
        
        {/* Component label */}
        <Text
          x={-width}
          y={height/2 + 10}
          text={label || name}
          fontSize={12}
          fill="#6b7280"
          align="center"
          width={width * 2}
        />
        
        {/* Selection indicators */}
        {isSelected && (
          <>
            {/* Delete button */}
            <Circle
              x={width/2 + 15}
              y={-height/2 - 15}
              radius={10}
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth={2}
              onClick={(e) => {
                e.evt.stopPropagation();
                onDelete();
              }}
            />
            <Text
              x={width/2 + 9}
              y={-height/2 - 21}
              text="×"
              fontSize={16}
              fill="white"
              onClick={(e) => {
                e.evt.stopPropagation();
                onDelete();
              }}
            />
            
            {/* Edit button */}
            <Circle
              x={width/2 + 15}
              y={height/2 + 15}
              radius={10}
              fill="#3b82f6"
              stroke="#ffffff"
              strokeWidth={2}
              onClick={(e) => {
                e.evt.stopPropagation();
                handleLabelEdit();
              }}
            />
            <Text
              x={width/2 + 9}
              y={height/2 + 9}
              text="✎"
              fontSize={12}
              fill="white"
              onClick={(e) => {
                e.evt.stopPropagation();
                handleLabelEdit();
              }}
            />
          </>
        )}
      </Group>
      

    </>
  );
}