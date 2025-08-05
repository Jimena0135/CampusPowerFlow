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
  isLocked?: boolean;
  isDragEnabled?: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  onDelete: () => void;
  onLabelUpdate: (label: string) => void;
  onStartEditing: (label: string) => void;
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
  isLocked = false,
  isDragEnabled = false,
  onSelect,
  onDragEnd,
  onResize,
  onDelete,
  onLabelUpdate,
  onStartEditing
}: ResizableBarraProps) {
  const groupRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasBeenDragged, setHasBeenDragged] = useState(false);

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

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
    }
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
        onTap={handleClick}
        onTransformEnd={handleTransformEnd}
      >
        {/* Barra rectangle with electrical busbar styling */}
        <Rect
          width={width}
          height={height}
          fill="#000000" // 100% black color for electrical busbar
          stroke={isSelected ? "#2563eb" : "#333333"}
          strokeWidth={isSelected ? 3 : 1}
          rx={1} // Slight rounding for modern electrical busbar look
        />
        
        {/* Multiple electrical connection points distributed along the bar */}
        {(() => {
          const numPoints = Math.max(3, Math.floor(width / 15)); // Mínimo 3 puntos, uno cada 15px
          const spacing = width / (numPoints - 1);
          const points = [];
          
          for (let i = 0; i < numPoints; i++) {
            const pointX = i * spacing;
            points.push(
              <Circle
                key={`connection-point-${i}`}
                x={pointX}
                y={height / 2}
                radius={2}
                fill={isSelected ? "#FFD700" : "#000000"}
                stroke={isSelected ? "#B8860B" : "#000000"}
                strokeWidth={1}
              />
            );
          }
          
          return points;
        })()}
        
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
            if (newBox.width < 30) {
              newBox.width = 30; // Minimum busbar length (más pequeño)
            }
            if (newBox.width > 300) {
              newBox.width = 300; // Maximum busbar length (más pequeño)
            }
            // Keep height consistent for busbars
            newBox.height = oldBox.height;
            return newBox;
          }}
        />
      )}
      

    </>
  );
}