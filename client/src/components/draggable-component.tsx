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
  isSelected: boolean;
  isLocked?: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
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
  isSelected,
  isLocked = false,
  onSelect,
  onDragEnd,
  onDelete,
  onLabelUpdate,
  onStartEditing,
  onClick,
  onDoubleClick
}: DraggableComponentProps) {
  const groupRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: any) => {
    setIsDragging(true);
  };

  const handleDragEnd = (e: any) => {
    setIsDragging(false);
    onDragEnd(e.target.x(), e.target.y());
  };

  const handleClick = (e: any) => {
    e.evt.stopPropagation();
    // Solo seleccionar si no estamos arrastrando
    if (!isDragging) {
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
        draggable={!isLocked}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        onDblClick={handleDoubleClick}
        onTap={handleClick}
        onDblTap={handleDoubleClick}
      >
        {/* Background for component - no circle */}
        
        {/* Component symbol */}
        <Text
          x={-15}
          y={-8}
          text={symbol}
          fontSize={24}
          fill="#374151"
          align="center"
          fontWeight="bold"
        />
        
        {/* Connection point at center of symbol */}
        <Circle
          x={0}
          y={-10} // Directamente en el centro del símbolo
          radius={3}
          fill="#FFD700"
          stroke="#B8860B"
          strokeWidth={1}
        />
        
        {/* Connection point indicator (small circle at center) */}
        <Circle
          x={0}
          y={0}
          radius={2}
          fill="#2563eb"
          opacity={0.6}
        />
        
        {/* Component label */}
        <Text
          x={-40}
          y={35}
          text={label || name}
          fontSize={12}
          fill="#6b7280"
          align="center"
          width={80}
        />
        
        {/* Selection indicators */}
        {isSelected && (
          <>
            {/* Delete button */}
            <Circle
              x={25}
              y={-25}
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
              x={19}
              y={-31}
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
              x={25}
              y={5}
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
              x={19}
              y={-1}
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