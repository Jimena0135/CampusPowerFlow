import { Group, Rect, Text, Circle } from "react-konva";
import { useRef, useState } from "react";
import { useElectricalData } from "@/hooks/use-electrical-data";
import type { Building } from "@shared/schema";

interface BuildingBlockProps {
  building: Building;
  x: number;
  y: number;
  onClick: () => void;
  isRealTimeActive: boolean;
  onRenameBuilding?: (id: string, newName: string) => void;
}

export default function BuildingBlock({ building, x, y, onClick, isRealTimeActive, onRenameBuilding }: BuildingBlockProps) {
  const { getLatestElectricalData, getLatestEnvironmentalData } = useElectricalData();
  const electricalData = getLatestElectricalData(building.id);
  const environmentalData = getLatestEnvironmentalData(building.id);
  const statusColor = building.isOnline ? "#4CAF50" : "#F44336";

  // Estado para edición del nombre
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(building.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Posición del input (ajustar si cambias el layout)
  const inputStyle: React.CSSProperties = {
    position: "absolute",
    left: x + 16,
    top: y + 16,
    width: 180,
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Arial",
    color: "#1F2937",
    zIndex: 10,
    background: "#fff",
    border: "1px solid #D1D5DB",
    borderRadius: 4,
    padding: "2px 6px"
  };

  // Enfocar input al entrar en modo edición
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Guardar el nuevo nombre
  const handleSave = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== building.name) {
      onRenameBuilding?.(building.id, editValue.trim());
    } else {
      setEditValue(building.name); // restaurar si no cambia
    }
  };

  // Render
  return (
    <>
      <Group x={x} y={y} onClick={onClick}>
        {/* Main building rectangle */}
        <Rect
          width={280}
          height={180}
          fill="white"
          stroke="#D1D5DB"
          strokeWidth={2}
          cornerRadius={8}
          shadowColor="rgba(0,0,0,0.1)"
          shadowBlur={10}
          shadowOffsetX={0}
          shadowOffsetY={4}
        />

        {/* Building name and status */}
        <Text
          x={16}
          y={16}
          text={building.name}
          fontSize={16}
          fontFamily="Arial"
          fontStyle="bold"
          fill="#1F2937"
          onClick={() => setIsEditing(true)}
          onDblClick={() => setIsEditing(true)}
          listening={!isEditing}
        />

        {/* Online status indicator */}
        <Circle
          x={250}
          y={24}
          radius={6}
          fill={statusColor}
        />

        {/* Electrical data display */}
        {electricalData && (
          <>
            <Rect x={16} y={50} width={120} height={40} fill="#EBF8FF" cornerRadius={4} />
            <Text x={24} y={58} text="Voltaje (V)" fontSize={10} fill="#6B7280" />
            <Text x={24} y={72} text={electricalData.voltage.toFixed(1)} fontSize={18} fontFamily="monospace" fill="#1976D2" />
            <Rect x={144} y={50} width={120} height={40} fill="#FFF3E0" cornerRadius={4} />
            <Text x={152} y={58} text="Corriente (A)" fontSize={10} fill="#6B7280" />
            <Text x={152} y={72} text={electricalData.current.toFixed(1)} fontSize={18} fontFamily="monospace" fill="#FF5722" />
            <Rect x={16} y={98} width={120} height={40} fill="#E8F5E8" cornerRadius={4} />
            <Text x={24} y={106} text="Potencia (kW)" fontSize={10} fill="#6B7280" />
            <Text x={24} y={120} text={electricalData.power.toFixed(1)} fontSize={18} fontFamily="monospace" fill="#4CAF50" />
            <Rect x={144} y={98} width={120} height={40} fill="#F5F5F5" cornerRadius={4} />
            <Text x={152} y={106} text="Factor P." fontSize={10} fill="#6B7280" />
            <Text x={152} y={120} text={electricalData.powerFactor.toFixed(2)} fontSize={18} fontFamily="monospace" fill="#424242" />
          </>
        )}

        {/* Environmental data */}
        {environmentalData && (
          <>
            <Text x={24} y={150} text={`Temp: ${environmentalData.temperature.toFixed(1)}°C`} fontSize={10} fontFamily="monospace" fill="#6B7280" />
            <Text x={152} y={150} text={`Humedad: ${environmentalData.humidity.toFixed(0)}%`} fontSize={10} fontFamily="monospace" fill="#6B7280" />
          </>
        )}
      </Group>
      {/* Input HTML para edición del nombre */}
      {isEditing && (
        <input
          ref={inputRef}
          style={inputStyle}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={e => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setIsEditing(false);
              setEditValue(building.name);
            }
          }}
        />
      )}
    </>
  );
}
