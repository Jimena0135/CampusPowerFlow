import { Group, Rect, Circle, Line, Text } from "react-konva";

interface ElectricalSymbolsProps {
  x: number;
  y: number;
}

export function ElectricalSymbols({ x, y }: ElectricalSymbolsProps) {
  return (
    <Group x={x} y={y}>
      {/* Main Electrical Feed Rectangle */}
      <Rect
        width={380}
        height={96}
        fill="white"
        stroke="#1976D2"
        strokeWidth={2}
        cornerRadius={8}
        shadowColor="rgba(0,0,0,0.1)"
        shadowBlur={10}
        shadowOffsetX={0}
        shadowOffsetY={4}
      />
      
      {/* Generator Symbol */}
      <Circle
        x={60}
        y={48}
        radius={24}
        stroke="#424242"
        strokeWidth={2}
        fill="white"
      />
      <Text
        x={48}
        y={40}
        text="G"
        fontSize={20}
        fontFamily="Arial"
        fontStyle="bold"
        fill="#424242"
      />
      
      {/* Connection Line */}
      <Line
        points={[100, 48, 200, 48]}
        stroke="#424242"
        strokeWidth={2}
      />
      
      {/* Arrow */}
      <Line
        points={[190, 43, 200, 48, 190, 53]}
        stroke="#424242"
        strokeWidth={2}
      />
      
      {/* Transformer Symbol */}
      <Rect
        x={220}
        y={24}
        width={48}
        height={48}
        stroke="#424242"
        strokeWidth={2}
        fill="white"
        cornerRadius={4}
      />
      
      {/* Transformer Terminals */}
      <Circle x={232} y={20} radius={4} stroke="#424242" strokeWidth={1} fill="white" />
      <Circle x={256} y={20} radius={4} stroke="#424242" strokeWidth={1} fill="white" />
      
      {/* Labels */}
      <Text x={20} y={20} text="Red Eléctrica" fontSize={12} fill="#424242" />
      <Text x={30} y={75} text="13.8 kV" fontSize={12} fontFamily="monospace" fill="#424242" />
      
      <Text x={280} y={20} text="Transformador" fontSize={12} fill="#424242" />
      <Text x={290} y={75} text="480V" fontSize={12} fontFamily="monospace" fill="#424242" />
      
      {/* Distribution Lines */}
      <Line
        points={[244, 80, 244, 180]}
        stroke="#424242"
        strokeWidth={2}
      />
      <Line
        points={[180, 160, 320, 160]}
        stroke="#424242"
        strokeWidth={2}
      />
    </Group>
  );
}
