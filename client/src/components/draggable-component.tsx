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
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onDelete: () => void;
  onLabelUpdate: (label: string) => void;
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
  onSelect,
  onDragEnd,
  onDelete,
  onLabelUpdate,
  onClick,
  onDoubleClick
}: DraggableComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(label || name);
  const groupRef = useRef<any>(null);

  const handleDragEnd = (e: any) => {
    onDragEnd(e.target.x(), e.target.y());
  };

  const handleLabelEdit = () => {
    setIsEditing(true);
  };

  const handleLabelSave = () => {
    onLabelUpdate(tempLabel);
    setIsEditing(false);
  };

  const handleLabelCancel = () => {
    setTempLabel(label || name);
    setIsEditing(false);
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        draggable={true}
        onDragEnd={handleDragEnd}
        onClick={(e) => {
          onSelect();
          if (onClick) {
            onClick();
          }
        }}
        onDblClick={(e) => {
          if (type === "carga" && onDoubleClick) {
            onDoubleClick();
          }
        }}
        onTap={(e) => {
          onSelect();
          if (onClick) {
            onClick();
          }
        }}
        onDblTap={(e) => {
          if (type === "carga" && onDoubleClick) {
            onDoubleClick();
          }
        }}
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
      
      {/* Label editing modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">Editar Etiqueta</h3>
            <Input
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              placeholder="Ingrese la etiqueta del componente"
              className="mb-4"
              autoFocus
            />
            <div className="flex space-x-2">
              <Button onClick={handleLabelSave} className="flex-1">
                Guardar
              </Button>
              <Button onClick={handleLabelCancel} variant="outline" className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}