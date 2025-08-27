import React, { useState, useEffect } from 'react';

interface ComponentQueryConfig {
  componentId: string;
  sqlQuery: string;
  dataSourceType: 'fiware' | 'custom_sql' | 'simulated';
  refreshInterval: number;
}

interface ComponentQueryManagerProps {
  componentId: string;
  componentName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ComponentQueryManager({ 
  componentId, 
  componentName, 
  isOpen, 
  onClose 
}: ComponentQueryManagerProps) {
  const [config, setConfig] = useState<ComponentQueryConfig>({
    componentId,
    sqlQuery: '',
    dataSourceType: 'fiware',
    refreshInterval: 10,
  });
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar configuración existente
  useEffect(() => {
    if (isOpen && componentId) {
      loadComponentConfig();
    }
  }, [isOpen, componentId]);

  const loadComponentConfig = async () => {
    try {
      const response = await fetch(`/api/components/${componentId}/query-config`);
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading component config:', error);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/components/${componentId}/query-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        alert('Configuración guardada exitosamente');
      } else {
        throw new Error('Error saving configuration');
      }
    } catch (error) {
      alert('No se pudo guardar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestQuery = async () => {
    if (!config.sqlQuery.trim()) {
      alert('Por favor ingresa una consulta SQL');
      return;
    }

    try {
      setIsLoading(true);
      setQueryResult(null);

      const response = await fetch('/api/components/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sqlQuery: config.sqlQuery }),
      });

      const result = await response.json();
      setQueryResult(result);

      if (result.success) {
        alert(`Consulta ejecutada: ${result.data?.length || 0} registros encontrados`);
      } else {
        alert(`Error en consulta: ${result.error}`);
      }
    } catch (error) {
      alert('No se pudo ejecutar la consulta');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #eee',
          paddingBottom: '10px'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            Configuración: {componentName}
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Fuente de Datos:
          </label>
          <select
            value={config.dataSourceType}
            onChange={(e) => setConfig(prev => ({ 
              ...prev, 
              dataSourceType: e.target.value as any 
            }))}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <option value="fiware">FIWARE (Tiempo Real)</option>
            <option value="custom_sql">Consulta SQL Personalizada</option>
            <option value="simulated">Datos Simulados</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Intervalo de Actualización (segundos):
          </label>
          <input
            type="number"
            min="5"
            max="3600"
            value={config.refreshInterval}
            onChange={(e) => setConfig(prev => ({ 
              ...prev, 
              refreshInterval: parseInt(e.target.value) || 10 
            }))}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Consulta SQL:
          </label>
          <textarea
            value={config.sqlQuery}
            onChange={(e) => setConfig(prev => ({ 
              ...prev, 
              sqlQuery: e.target.value 
            }))}
            placeholder="SELECT voltage, current, power FROM electrical_data WHERE ..."
            rows={6}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px' 
        }}>
          <button
            onClick={handleTestQuery}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? 'Ejecutando...' : 'Probar Consulta'}
          </button>
          <button
            onClick={handleSaveConfig}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>

        {queryResult && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            backgroundColor: '#f8f9fa'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Resultado de la Consulta:</h3>
            {queryResult.success ? (
              <div>
                <p style={{ color: '#28a745', margin: '0 0 10px 0' }}>
                  ✓ Consulta ejecutada exitosamente - {queryResult.data?.length || 0} registros
                </p>
                {queryResult.data && queryResult.data.length > 0 && (
                  <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#e9ecef' }}>
                          {Object.keys(queryResult.data[0]).map((key) => (
                            <th key={key} style={{ 
                              padding: '8px', 
                              border: '1px solid #ddd',
                              textAlign: 'left'
                            }}>
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.data.slice(0, 5).map((row: any, index: number) => (
                          <tr key={index}>
                            {Object.values(row).map((value: any, cellIndex: number) => (
                              <td key={cellIndex} style={{ 
                                padding: '8px', 
                                border: '1px solid #ddd'
                              }}>
                                {typeof value === 'number' ? value.toFixed(2) : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {queryResult.data.length > 5 && (
                      <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
                        Mostrando 5 de {queryResult.data.length} registros
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: '#dc3545', margin: 0 }}>
                ✗ Error: {queryResult.error}
              </p>
            )}
          </div>
        )}

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <strong>Ejemplos de consultas:</strong>
          <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
            <li>FIWARE: <code>SELECT voltage, current FROM et_electrical_data ORDER BY time_index DESC LIMIT 10</code></li>
            <li>Histórico: <code>SELECT AVG(power) as avg_power FROM mt_electrical_data WHERE time_index &gt; now() - '1 hour'::interval</code></li>
            <li>Componente: <code>SELECT * FROM electrical_data WHERE component_id = '{componentId}' ORDER BY timestamp DESC LIMIT 5</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
