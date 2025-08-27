import React, { useRef, useState, useEffect } from "react";
import { Group, Rect, Text, Circle, Line } from "react-konva";
import { SolarPanelIcon, TransformerIcon } from "./icons";
import { BarraColectora, TransformadorCircular, GeneradorSolar, CargaFlecha, Bateria, BateriaInversor } from "./simbolos-tecnicos";

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
  onClick?: () => void;
  onDoubleClick?: () => void;
  onRename?: (id: string, newName: string) => void;
  onStartEditing?: (id: string, label: string, x: number, y: number, width: number, height: number) => void;
}


export default function DraggableComponent(props: DraggableComponentProps) {
  const {
    id,
    type,
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
    isConnected = false,
    onSelect,
    onDragEnd,
    onResize,
    onDelete,
    onClick,
    onDoubleClick
  } = props;
  const finalWidth = typeof width === 'number' ? width : 50;
  const finalHeight = typeof height === 'number' ? height : 50;
  const groupRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasBeenDragged, setHasBeenDragged] = useState(false);
  // Ya no se maneja edición local, sino desde el padre

  // ...otros handlers como drag, click, etc...

  // Mapeo de tipo/símbolo a componente técnico
  const renderTechnicalSymbol = () => {
    switch (type) {
      case "barra_colectora":
      case "barras":
        // Permitir estiramiento horizontal y ajustar altura mínima para la barra
        return <BarraColectora width={finalWidth} height={16} connectionCount={4} />;
      case "transformador_circular":
        return <TransformadorCircular size={finalWidth} />;
      case "generador_solar":
        return <GeneradorSolar size={finalWidth} />;
      case "bateria":
        return <Bateria size={finalWidth} />;
      case "bateria_inversor":
        return <BateriaInversor size={finalWidth} />;
      case "carga_flecha":
        return <CargaFlecha size={finalWidth} />;
      case "fuente_voltaje":
        return <FuenteVoltaje size={finalWidth} />;
      default:
        return null;
    }
  };

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
      draggable={!isLocked && isDragEnabled}
      onDragStart={(e: any) => { if (!isDragEnabled) return; setIsDragging(true); setHasBeenDragged(false); }}
      onDragMove={(e: any) => { if (!isDragEnabled) return; if (isDragging) setHasBeenDragged(true); }}
      onDragEnd={(e: any) => { if (!isDragEnabled) return; setIsDragging(false); if (hasBeenDragged) onDragEnd(e.target.x(), e.target.y()); setHasBeenDragged(false); }}
      onClick={(e: any) => { e.evt.stopPropagation(); if (!isDragging && !hasBeenDragged) { onSelect(); if (onClick) onClick(); } }}
  onDblClick={(e: any) => { e.evt.stopPropagation(); if ((type === "carga" || type === "load" || type === "bateria" || type === "bateria_inversor" || type === "generador_solar" || type === "carga_flecha") && onDoubleClick) onDoubleClick(); }}
      onTap={(e: any) => { e.evt.stopPropagation(); if (!isDragging && !hasBeenDragged) { onSelect(); if (onClick) onClick(); } }}
  onDblTap={(e: any) => { e.evt.stopPropagation(); if ((type === "carga" || type === "load" || type === "bateria" || type === "bateria_inversor" || type === "generador_solar" || type === "carga_flecha") && onDoubleClick) onDoubleClick(); }}
    >
      {/* Símbolo del componente */}
      {renderTechnicalSymbol() || (
        type === "solar_panel" ? (
          <Group x={-finalWidth/4} y={-finalHeight/4} scaleX={finalWidth/50} scaleY={finalHeight/50}>
            <Rect x={2} y={12} width={24} height={12} fill="#90caf9" stroke="#1976d2" strokeWidth={1.5} cornerRadius={2} />
            <Rect x={4} y={14} width={4} height={8} fill="#e3f2fd" stroke="#1976d2" strokeWidth={0.8} />
            <Rect x={10} y={14} width={4} height={8} fill="#e3f2fd" stroke="#1976d2" strokeWidth={0.8} />
            <Rect x={16} y={14} width={4} height={8} fill="#e3f2fd" stroke="#1976d2" strokeWidth={0.8} />
            <Rect x={22} y={14} width={2} height={8} fill="#e3f2fd" stroke="#1976d2" strokeWidth={0.8} />
            <Line points={[14,24,14,30]} stroke="#1976d2" strokeWidth={1.5} />
            <Circle x={14} y={8} radius={3} fill="#fffde7" stroke="#fbc02d" strokeWidth={1.5} />
            <Line points={[14,2,14,5]} stroke="#fbc02d" strokeWidth={1.2} />
            <Line points={[7,8,11,8]} stroke="#fbc02d" strokeWidth={1.2} />
            <Line points={[17,8,21,8]} stroke="#fbc02d" strokeWidth={1.2} />
          </Group>
        ) : type === "transformer" ? (
          <Group x={-finalWidth/4} y={-finalHeight/4} scaleX={finalWidth/50} scaleY={finalHeight/50}>
            <Rect x={6} y={10} width={16} height={12} fill="#fffde7" stroke="#ffb300" strokeWidth={1.5} cornerRadius={2} />
            <Circle x={10} y={16} radius={2} fill="#fff" stroke="#ffb300" strokeWidth={1} />
            <Circle x={18} y={16} radius={2} fill="#fff" stroke="#ffb300" strokeWidth={1} />
            <Line points={[14,22,14,30]} stroke="#ffb300" strokeWidth={1.5} />
            <Line points={[14,2,14,10]} stroke="#ffb300" strokeWidth={1.5} />
            <Line points={[12,6,14,2,16,6]} stroke="#ffb300" strokeWidth={1.2} />
            <Line points={[12,26,14,30,16,26]} stroke="#ffb300" strokeWidth={1.2} />
          </Group>
        ) : type === "inverter" ? (
          <Group x={-finalWidth/4} y={-finalHeight/4} scaleX={finalWidth/50} scaleY={finalHeight/50}>
            <Rect x={6} y={10} width={16} height={12} fill="#e0f7fa" stroke="#00838f" strokeWidth={1.5} cornerRadius={2} />
            <Line points={[8,18,10,14,12,22,14,14,16,22,18,14,20,18]} stroke="#00838f" strokeWidth={1.2} lineCap="round" lineJoin="round" />
          </Group>
        ) : (
          <Text
            x={-finalWidth/4}
            y={-finalHeight/4}
            text={symbol}
            fontSize={Math.min(finalWidth, finalHeight) * 0.4}
            fill="#374151"
            align="center"
            fontWeight="bold"
          />
        )
      )}
      {/* Puntos de conexión para barra colectora: ya se dibujan en el símbolo, así que no los repetimos aquí */}
      {type !== "barra_colectora" && type !== "barras" && (
        <>
          <Circle
            x={0}
            y={-finalHeight/4}
            radius={Math.min(finalWidth, finalHeight) * 0.06}
            fill={isConnected ? "#10B981" : "#FFD700"}
            stroke={isConnected ? "#059669" : "#B8860B"}
            strokeWidth={1}
          />
          <Circle
            x={0}
            y={0}
            radius={Math.min(finalWidth, finalHeight) * 0.04}
            fill={isConnected ? "#10B981" : "#2563eb"}
            opacity={0.6}
          />
        </>
      )}
      {/* Etiqueta del componente */}
      {/* Etiqueta editable */}
      <Text
        x={-finalWidth}
        y={finalHeight/2 + 10}
        text={label || name}
        fontSize={12}
        fill="#6b7280"
        align="center"
        width={finalWidth * 2}
        className="component-label"
        onClick={() => props.onStartEditing?.(id, label || name, x - finalWidth, y + finalHeight/2 + 10, finalWidth * 2, 24)}
        onDblClick={() => props.onStartEditing?.(id, label || name, x - finalWidth, y + finalHeight/2 + 10, finalWidth * 2, 24)}
        style={{ cursor: 'pointer' }}
      />
      {/* Botones de selección */}
      {isSelected && (
        <>
          <Circle
            x={finalWidth/2 + 15}
            y={-finalHeight/2 - 15}
            radius={10}
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth={2}
            onClick={(e: any) => { e.evt.stopPropagation(); onDelete(); }}
          />
          <Text
            x={finalWidth/2 + 9}
            y={-finalHeight/2 - 21}
            text="×"
            fontSize={16}
            fill="white"
            onClick={(e: any) => { e.evt.stopPropagation(); onDelete(); }}
          />
        </>
      )}
    </Group>
  );
}