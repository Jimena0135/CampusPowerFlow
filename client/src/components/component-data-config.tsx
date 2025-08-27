import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, BarChart3, Database, Zap } from 'lucide-react';

interface QueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  columns?: string[];
}

interface ComponentDataConfigProps {
  componentId: string;
  componentType: string;
  onClose: () => void;
}

export const ComponentDataConfig: React.FC<ComponentDataConfigProps> = ({
  componentId,
  componentType,
  onClose
}) => {
  const [selectedExample, setSelectedExample] = useState<string>('');
  const [customQuery, setCustomQuery] = useState<string>('');
  const [exampleQueries, setExampleQueries] = useState<Record<string, string>>({});
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Mapeo de tipos de componentes a consultas de ejemplo
  const componentTypeMapping: Record<string, string> = {
    'smart-meter': 'smart_meter',
    'battery': 'battery_monitor',
    'weather-station': 'weather_station',
    'solar-panel': 'solar_panel_enphase',
    'fronius-inverter': 'solar_panel_fronius',
    'inverter': 'inverter_xw',
    'sensor': 'sensor_card'
  };

  useEffect(() => {
    // Cargar consultas de ejemplo
    fetch('/api/component-queries/examples')
      .then(res => res.json())
      .then(data => {
        setExampleQueries(data);
        
        // Auto-seleccionar consulta basada en el tipo de componente
        const mappedType = componentTypeMapping[componentType];
        if (mappedType && data[mappedType]) {
          setSelectedExample(mappedType);
          setCustomQuery(data[mappedType]);
        }
      })
      .catch(console.error);
  }, [componentType]);

  const executeQuery = async () => {
    if (!customQuery.trim()) return;

    setIsExecuting(true);
    try {
      const response = await fetch('/api/component-queries/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sqlQuery: customQuery })
      });
      
      const result = await response.json();
      setQueryResult(result);
    } catch (error) {
      setQueryResult({
        success: false,
        error: 'Error de conexión al ejecutar la consulta'
      });
    }
    setIsExecuting(false);
  };

  const handleExampleSelect = (exampleKey: string) => {
    setSelectedExample(exampleKey);
    setCustomQuery(exampleQueries[exampleKey] || '');
    setQueryResult(null);
  };

  const saveConfiguration = async () => {
    try {
      const response = await fetch(`/api/components/${componentId}/query-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sqlQuery: customQuery,
          dataSourceType: 'fiware',
          refreshInterval: 30
        })
      });

      if (response.ok) {
        alert('Configuración guardada exitosamente');
        onClose();
      } else {
        alert('Error al guardar la configuración');
      }
    } catch (error) {
      alert('Error de conexión al guardar');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Configuración de Datos - {componentId}
            </CardTitle>
            <p className="text-sm text-gray-600">
              Configura qué datos mostrar para este componente tipo: {componentType}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Selección de consulta de ejemplo */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Consultas de Ejemplo
              </label>
              <Select value={selectedExample} onValueChange={handleExampleSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una consulta de ejemplo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(exampleQueries).map(([key, query]) => (
                    <SelectItem key={key} value={key}>
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Editor de consulta SQL */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Consulta SQL Personalizada
              </label>
              <Textarea
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="SELECT * FROM etsmartmeter ORDER BY time_index DESC LIMIT 10"
                className="font-mono text-sm"
                rows={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                Tablas disponibles: etsmartmeter, etbattmon_combox, etweatherstation, etenphaseinverter, etfroniusinverter, etinverterxw, etfroniussensorcard
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <Button 
                onClick={executeQuery} 
                disabled={isExecuting || !customQuery.trim()}
                className="flex items-center gap-2"
              >
                <PlayCircle className="w-4 h-4" />
                {isExecuting ? 'Ejecutando...' : 'Probar Consulta'}
              </Button>
              
              <Button 
                onClick={saveConfiguration}
                variant="default"
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Guardar Configuración
              </Button>
              
              <Button onClick={onClose} variant="outline">
                Cancelar
              </Button>
            </div>

            {/* Resultado de la consulta */}
            {queryResult && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Resultado de la Consulta
                </h3>
                
                {queryResult.success ? (
                  <div>
                    <div className="mb-3 flex gap-2">
                      <Badge variant="outline">
                        {queryResult.data?.length || 0} filas
                      </Badge>
                      <Badge variant="outline">
                        {queryResult.columns?.length || 0} columnas
                      </Badge>
                    </div>
                    
                    {queryResult.data && queryResult.data.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto max-h-64">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                {queryResult.columns?.map((col, i) => (
                                  <th key={i} className="px-3 py-2 text-left font-medium">
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {queryResult.data.slice(0, 10).map((row, i) => (
                                <tr key={i} className="border-t">
                                  {queryResult.columns?.map((col, j) => (
                                    <td key={j} className="px-3 py-2">
                                      {typeof row[col] === 'number' ? row[col].toFixed(2) : String(row[col] || '')}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {queryResult.data.length > 10 && (
                          <div className="bg-gray-50 px-3 py-2 text-sm text-gray-600">
                            Mostrando 10 de {queryResult.data.length} filas
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No se encontraron datos
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">Error en la consulta</h4>
                    <p className="text-red-700 text-sm">{queryResult.error}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
