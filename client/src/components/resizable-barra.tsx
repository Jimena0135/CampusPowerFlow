import React, { useRef } from "react";
import { Group, Rect, Circle, Text } from "react-konva";

interface ResizableBarraProps {
  id: string;
  symbol: string;
  name: string;
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
  isLocked?: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onDelete: () => void;
  onLabelUpdate: (label: string) => void;
  onStartEditing: (label: string) => void;
}

const ResizableBarra: React.FC<ResizableBarraProps> = ({
  id,
  symbol,
  name,
  label,
  x,
  y,
  width,
  height,
  isSelected,
  isLocked = false,
  onSelect,
  onDragEnd,
  onDelete,
  onLabelUpdate,
  onStartEditing
}) => {
  const groupRef = useRef<any>(null);

  const handleDragEnd = (e: any) => {
    onDragEnd(e.target.x(), e.target.y());
  };

  const handleLabelEdit = () => {
    onStartEditing(label || name);
  };

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
      draggable={!isLocked}
      onDragEnd={handleDragEnd}
      onClick={onSelect}
      onTap={onSelect}
    >
      {/* Barra principal */}
      <Rect
        x={-width/2}
        y={-height/2}
        width={width}
        height={height}
        fill="#222"
        stroke={isSelected ? "#2563eb" : "#333333"}
        strokeWidth={isSelected ? 3 : 1}
        cornerRadius={2}
      />
      {/* Puntos de conexión laterales */}
      <Circle
        x={-width/2}
        y={0}
        radius={5}
        fill="#fff"
        stroke={isSelected ? "#2563eb" : "#222"}
        strokeWidth={2}
      />
      <Circle
        x={width/2}
        y={0}
        radius={5}
        fill="#fff"
        stroke={isSelected ? "#2563eb" : "#222"}
        strokeWidth={2}
      />
      {/* Etiqueta del componente */}
      <Text
        x={-width/2}
        y={height/2 + 10}
        width={width}
        align="center"
        text={label || name}
        fontSize={14}
        fill="#6b7280"
      />
      {/* Botones de selección */}
      {isSelected && (
        <>
          {/* Botón eliminar */}
          <Circle
            x={width/2 + 18}
            y={-height/2 - 18}
            radius={10}
            fill="#ef4444"
            stroke="#fff"
            strokeWidth={2}
            onClick={(e: any) => {
              e.evt.stopPropagation();
              onDelete();
            }}
          />
          <Text
            x={width/2 + 12}
            y={-height/2 - 24}
            text="×"
            fontSize={16}
            fill="white"
            onClick={(e: any) => {
              e.evt.stopPropagation();
              onDelete();
            }}
          />
          {/* Botón editar */}
          <Circle
            x={width/2 + 18}
            y={height/2 + 18}
            radius={10}
            fill="#3b82f6"
            stroke="#fff"
            strokeWidth={2}
            onClick={(e: any) => {
              e.evt.stopPropagation();
              handleLabelEdit();
            }}
          />
          <Text
            x={width/2 + 12}
            y={height/2 + 12}
            text="✎"
            fontSize={12}
            fill="white"
            onClick={(e: any) => {
              e.evt.stopPropagation();
              handleLabelEdit();
            }}
          />
        </>
      )}
    </Group>
  );
};

export default ResizableBarra;