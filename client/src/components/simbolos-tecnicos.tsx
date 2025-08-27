// Batería (círculo con símbolos + y - y líneas)
export const Bateria = ({ size = 32, color = "#222" }) => {
  const r = size * 0.45;
  return (
    <Group>
      {/* Círculo */}
      <Circle x={0} y={0} radius={r} stroke={color} strokeWidth={2} />
      {/* Línea horizontal */}
      <Line points={[-r*0.7, 0, r*0.7, 0]} stroke={color} strokeWidth={2} />
      {/* Línea vertical superior */}
      <Line points={[0, -r*0.7, 0, 0]} stroke={color} strokeWidth={2} />
      {/* Línea vertical inferior */}
      <Line points={[0, 0, 0, r*0.7]} stroke={color} strokeWidth={2} />
      {/* Símbolo + */}
      <Line points={[r*0.25, -r*0.45, r*0.25, -r*0.25]} stroke={color} strokeWidth={2} />
      <Line points={[r*0.18, -r*0.35, r*0.32, -r*0.35]} stroke={color} strokeWidth={2} />
      {/* Símbolo - */}
      <Line points={[r*0.18, r*0.35, r*0.32, r*0.35]} stroke={color} strokeWidth={2} />
    </Group>
  );
};

// Batería con inversor (cuadro con línea diagonal, AC y DC)
export const BateriaInversor = ({ size = 32, color = "#222" }) => {
  const w = size * 0.9;
  const h = size * 0.9;
  const y0 = -h/2;
  return (
    <Group>
      {/* Cuadro */}
      <Rect x={-w/2} y={y0} width={w} height={h} stroke={color} strokeWidth={2} fill="#fff" />
      {/* Línea diagonal */}
      <Line points={[-w/2, y0 + h, w/2, y0]} stroke={color} strokeWidth={2} />
      {/* AC (onda senoidal) */}
      <Line points={[-w/2 + w*0.18, y0 + h*0.22, -w/2 + w*0.22, y0 + h*0.18, -w/2 + w*0.26, y0 + h*0.22]} stroke={color} strokeWidth={2} />
      {/* DC (dos líneas) */}
      <Line points={[w/2 - w*0.22, y0 + h*0.78, w/2 - w*0.14, y0 + h*0.78]} stroke={color} strokeWidth={2} />
      <Line points={[w/2 - w*0.19, y0 + h*0.82, w/2 - w*0.19, y0 + h*0.74]} stroke={color} strokeWidth={2} />
      <Line points={[w/2 - w*0.22, y0 + h*0.82, w/2 - w*0.14, y0 + h*0.82]} stroke={color} strokeWidth={2} />
    </Group>
  );
};

// Transformador circular (dos círculos intersectados y línea solo hacia afuera, sin pasar por dentro)
export const TransformadorCircular = ({ size = 32, color = "#222" }) => {
  const r = size * 0.32;
  const yOffset = r * 0.7;
  // Coordenadas de los puntos de contacto
  const topY = -yOffset - r;
  const bottomY = yOffset + r;
  const lineLen = r * 1.2; // cuánto sobresale la línea
  return (
    <Group>
      {/* Círculo superior */}
      <Circle x={0} y={-yOffset} radius={r} stroke={color} strokeWidth={2} />
      {/* Círculo inferior */}
      <Circle x={0} y={yOffset} radius={r} stroke={color} strokeWidth={2} />
      {/* Línea solo hacia afuera */}
      <Line points={[0, topY - lineLen, 0, topY]} stroke={color} strokeWidth={2} />
      <Line points={[0, bottomY, 0, bottomY + lineLen]} stroke={color} strokeWidth={2} />
    </Group>
  );
};


// Generador Solar (sobre más alto y estilizado)
export const GeneradorSolar = ({ size = 32, color = "#222" }) => {
  const w = size * 0.6;
  const h = size * 0.8;
  const y0 = -h/2;
  return (
    <Group>
      {/* Rectángulo base */}
      <Rect x={-w/2} y={y0} width={w} height={h} stroke={color} strokeWidth={2} fill="#fff" />
      {/* Triángulo (tapa del sobre) */}
      <Line points={[-w/2, y0, 0, y0 + h*0.5, w/2, y0]} stroke={color} strokeWidth={2} />
    </Group>
  );
};

// Carga (flecha hacia abajo)
export const CargaFlecha = ({ size = 32, color = "#222" }) => (
  <Group>
    <Line points={[0, -size/2.5, 0, size/4]} stroke={color} strokeWidth={2} />
    <Line points={[-size/6, size/8, 0, size/4, size/6, size/8]} stroke={color} strokeWidth={2} />
  </Group>
);
import React from "react";
import { Group, Rect, Line, Circle, Text } from "react-konva";

// Barra colectora (Busbar)
// Barra colectora con múltiples puntos de conexión abajo y estirable horizontalmente
export const BarraColectora = ({ width = 80, height = 8, color = "#222", connectionCount = 4 }) => {
  // Calcula la separación entre puntos de conexión
  const spacing = width / (connectionCount + 1);
  const points = Array.from({ length: connectionCount }, (_, i) => (-width/2) + spacing * (i + 1));
  return (
    <Group>
      {/* Barra principal */}
      <Rect x={-width/2} y={-height/2} width={width} height={height} fill={color} cornerRadius={2} />
      {/* Puntos de conexión en la parte inferior */}
      {points.map((x, idx) => (
        <Circle
          key={idx}
          x={x}
          y={height/2 + 6}
          radius={4}
          fill="#fff"
          stroke={color}
          strokeWidth={2}
        />
      ))}
    </Group>
  );
};



// Transformador
export const Transformador = ({ size = 32, color = "#222" }) => (
  <Group>
    <Circle x={-size/4} y={0} radius={size/4} stroke={color} strokeWidth={2} />
    <Circle x={size/4} y={0} radius={size/4} stroke={color} strokeWidth={2} />
  </Group>
);

// Generador
export const Generador = ({ size = 32, color = "#222" }) => (
  <Group>
    <Circle x={0} y={0} radius={size/2.5} stroke={color} strokeWidth={2} />
    <Text x={-size/4} y={-size/4} text="G" fontSize={size/2} fill={color} />
  </Group>
);

// Fuente de voltaje
export const FuenteVoltaje = ({ size = 32, color = "#222" }) => (
  <Group>
    <Circle x={0} y={0} radius={size/2.5} stroke={color} strokeWidth={2} />
    <Line points={[0, -size/4, 0, size/4]} stroke={color} strokeWidth={2} />
    <Line points={[-size/8, size/8, size/8, size/8]} stroke={color} strokeWidth={2} />
  </Group>
);

// Puedes seguir este patrón para el resto de símbolos técnicos.
