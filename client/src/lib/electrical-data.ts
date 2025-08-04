export interface ElectricalReading {
  timestamp: Date;
  voltage: number;
  current: number;
  power: number;
  powerFactor: number;
  frequency: number;
  thd: number;
}

export interface EnvironmentalReading {
  timestamp: Date;
  temperature: number;
  humidity: number;
  illumination: number;
}

export interface BuildingData {
  id: string;
  name: string;
  type: string;
  isOnline: boolean;
  lastUpdate: Date;
  electrical: ElectricalReading;
  environmental: EnvironmentalReading;
}

// NTC2050 Electrical Symbol definitions
export const NTC2050_SYMBOLS = {
  TRANSFORMER: {
    name: "Transformador",
    symbol: "⚡",
    category: "generation",
    description: "Transformador de distribución según NTC2050"
  },
  BREAKER: {
    name: "Interruptor",
    symbol: "↗",
    category: "protection",
    description: "Interruptor automático según NTC2050"
  },
  FUSE: {
    name: "Fusible",
    symbol: "—•—",
    category: "protection",
    description: "Fusible de protección según NTC2050"
  },
  MOTOR: {
    name: "Motor",
    symbol: "M",
    category: "load",
    description: "Motor eléctrico según NTC2050"
  },
  GENERATOR: {
    name: "Generador",
    symbol: "G",
    category: "generation",
    description: "Generador eléctrico según NTC2050"
  },
  GROUND: {
    name: "Tierra",
    symbol: "⏚",
    category: "grounding",
    description: "Conexión a tierra según NTC2050"
  },
  VOLTMETER: {
    name: "Voltímetro",
    symbol: "V",
    category: "measurement",
    description: "Instrumento de medición de voltaje"
  },
  AMMETER: {
    name: "Amperímetro",
    symbol: "A",
    category: "measurement",
    description: "Instrumento de medición de corriente"
  },
  WATTMETER: {
    name: "Wattímetro",
    symbol: "W",
    category: "measurement",
    description: "Instrumento de medición de potencia"
  }
} as const;

// Electrical parameter validation
export function validateElectricalParameters(data: Partial<ElectricalReading>): string[] {
  const errors: string[] = [];
  
  if (data.voltage !== undefined) {
    if (data.voltage < 0 || data.voltage > 600) {
      errors.push("Voltaje fuera de rango permitido (0-600V)");
    }
  }
  
  if (data.current !== undefined) {
    if (data.current < 0 || data.current > 1000) {
      errors.push("Corriente fuera de rango permitido (0-1000A)");
    }
  }
  
  if (data.powerFactor !== undefined) {
    if (data.powerFactor < 0 || data.powerFactor > 1) {
      errors.push("Factor de potencia debe estar entre 0 y 1");
    }
  }
  
  if (data.frequency !== undefined) {
    if (data.frequency < 59 || data.frequency > 61) {
      errors.push("Frecuencia fuera de rango nominal (59-61 Hz)");
    }
  }
  
  if (data.thd !== undefined) {
    if (data.thd < 0 || data.thd > 100) {
      errors.push("THD debe estar entre 0% y 100%");
    }
  }
  
  return errors;
}

// Alert conditions based on electrical parameters
export function checkAlertConditions(reading: ElectricalReading): Array<{type: string, severity: string, message: string}> {
  const alerts = [];
  
  // Voltage alerts
  if (reading.voltage < 450) {
    alerts.push({
      type: 'voltage_low',
      severity: 'warning',
      message: `Voltaje bajo detectado: ${reading.voltage.toFixed(1)}V`
    });
  } else if (reading.voltage > 480) {
    alerts.push({
      type: 'voltage_high',
      severity: 'warning',
      message: `Voltaje alto detectado: ${reading.voltage.toFixed(1)}V`
    });
  }
  
  // Current alerts
  if (reading.current > 300) {
    alerts.push({
      type: 'current_high',
      severity: 'critical',
      message: `Corriente alta detectada: ${reading.current.toFixed(1)}A`
    });
  }
  
  // Power factor alerts
  if (reading.powerFactor < 0.85) {
    alerts.push({
      type: 'power_factor_low',
      severity: 'warning',
      message: `Factor de potencia bajo: ${reading.powerFactor.toFixed(2)}`
    });
  }
  
  // THD alerts
  if (reading.thd > 5) {
    alerts.push({
      type: 'thd_high',
      severity: 'warning',
      message: `Distorsión armónica alta: ${reading.thd.toFixed(1)}%`
    });
  }
  
  // Frequency alerts
  if (reading.frequency < 59.5 || reading.frequency > 60.5) {
    alerts.push({
      type: 'frequency_deviation',
      severity: 'critical',
      message: `Frecuencia fuera de rango: ${reading.frequency.toFixed(2)}Hz`
    });
  }
  
  return alerts;
}

// Calculate electrical efficiency
export function calculateEfficiency(readings: ElectricalReading[]): number {
  if (readings.length === 0) return 0;
  
  const avgPowerFactor = readings.reduce((sum, r) => sum + r.powerFactor, 0) / readings.length;
  const avgTHD = readings.reduce((sum, r) => sum + r.thd, 0) / readings.length;
  
  // Simplified efficiency calculation based on power factor and THD
  const efficiency = (avgPowerFactor * (100 - avgTHD)) / 100;
  return Math.max(0, Math.min(100, efficiency * 100));
}
