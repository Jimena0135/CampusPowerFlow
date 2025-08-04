import { useState, useRef, useEffect } from "react";
import { Group, Rect, Text, Circle, Transformer } from "react-konva";

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
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  onDelete: () => void;
  onLabelUpdate: (label: string) => void;
}

export default function ResizableBarra({
  id,
  symbol,
  name,
  label,
  x,
  y,
  width,
  height,
  isSelected,
  onSelect,
  onDragEnd,
  onResize,
  onDelete,
  onLabelUpdate
}: ResizableBarraProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(label || name);
  const groupRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: any) => {
    onDragEnd(e.target.x(), e.target.y());
  };

  const handleTransformEnd = () => {
    if (groupRef.current) {
      const node = groupRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      
      // Reset scale and update dimensions
      node.scaleX(1);
      node.scaleY(1);
      
      onResize(width * scaleX, height * scaleY);
    }
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
        onClick={onSelect}
        onTap={onSelect}
        onTransformEnd={handleTransformEnd}
      >
        {/* Barra rectangle with electrical busbar styling */}
        <Rect
          width={width}
          height={height}
          fill="#C0C0C0" // Metallic silver color for electrical busbar
          stroke={isSelected ? "#2563eb" : "#808080"}
          strokeWidth={isSelected ? 3 : 2}
          rx={2} // Slight rounding for modern electrical busbar look
        />
        
        {/* Electrical connection points */}
        <Circle
          x={5}
          y={height / 2}
          radius={3}
          fill="#FFD700"
          stroke="#B8860B"
          strokeWidth={1}
        />
        <Circle
          x={width - 5}
          y={height / 2}
          radius={3}
          fill="#FFD700"
          stroke="#B8860B"
          strokeWidth={1}
        />
        
        {/* Component label */}
        <Text
          x={width / 2 - 20}
          y={height + 10}
          text={label || name}
          fontSize={12}
          fill="#6b7280"
          align="center"
          width={40}
        />
        
        {/* Selection indicators */}
        {isSelected && (
          <>
            {/* Delete button */}
            <Circle
              x={width + 15}
              y={-15}
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
              x={width + 9}
              y={-21}
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
              x={width + 15}
              y={15}
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
              x={width + 9}
              y={9}
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
      
      {/* Transformer for resizing */}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          keepRatio={false}
          enabledAnchors={['middle-left', 'middle-right']} // Only horizontal resizing for electrical busbars
          boundBoxFunc={(oldBox, newBox) => {
            // Minimum and maximum size constraints for electrical busbars
            if (newBox.width < 40) {
              newBox.width = 40; // Minimum busbar length
            }
            if (newBox.width > 400) {
              newBox.width = 400; // Maximum busbar length
            }
            // Keep height consistent for busbars
            newBox.height = oldBox.height;
            return newBox;
          }}
        />
      )}
      
      {/* Label editing modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">Editar Etiqueta</h3>
            <input
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              placeholder="Ingrese la etiqueta del componente"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              autoFocus
            />
            <div className="flex space-x-2">
              <button onClick={handleLabelSave} className="flex-1 bg-blue-600 text-white p-2 rounded">
                Guardar
              </button>
              <button onClick={handleLabelCancel} className="flex-1 bg-gray-300 text-gray-700 p-2 rounded">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}