import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

interface ComponentQueryConfig {
  componentId: string;
  sqlQuery: string;
  dataSourceType: 'fiware' | 'custom_sql' | 'simulated';
  refreshInterval: number;
}

interface ComponentData {
  id: string;
  timestamp: Date;
  data: Record<string, any>;
}

interface UseComponentQueryResult {
  config: ComponentQueryConfig | null;
  data: ComponentData | null;
  isLoading: boolean;
  error: string | null;
  updateConfig: (newConfig: Partial<ComponentQueryConfig>) => Promise<void>;
  executeQuery: () => Promise<void>;
  refetch: () => void;
}

export function useComponentQuery(componentId: string): UseComponentQueryResult {
  const [config, setConfig] = useState<ComponentQueryConfig | null>(null);
  const [data, setData] = useState<ComponentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Cargar configuración inicial
  useEffect(() => {
    if (componentId) {
      loadConfig();
    }
  }, [componentId]);

  // Configurar auto-refresh
  useEffect(() => {
    if (config && config.refreshInterval > 0) {
      clearInterval(intervalId!);
      const newIntervalId = setInterval(() => {
        executeQuery();
      }, config.refreshInterval * 1000);
      setIntervalId(newIntervalId);

      return () => clearInterval(newIntervalId);
    }
  }, [config?.refreshInterval]);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/components/${componentId}/query-config`);
      if (response.ok) {
        const configData = await response.json();
        setConfig(configData);
        
        // Cargar datos más recientes si existe configuración
        if (configData.sqlQuery) {
          loadLatestData();
        }
      } else if (response.status === 404) {
        // Componente sin configuración - crear configuración por defecto
        const defaultConfig: ComponentQueryConfig = {
          componentId,
          sqlQuery: '',
          dataSourceType: 'fiware',
          refreshInterval: 10,
        };
        setConfig(defaultConfig);
      }
    } catch (err) {
      setError('Error loading component configuration');
      console.error('Error loading config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLatestData = async () => {
    try {
      const response = await fetch(`/api/components/${componentId}/latest-data`);
      if (response.ok) {
        const latestData = await response.json();
        if (latestData) {
          setData({
            id: latestData.id,
            timestamp: new Date(latestData.timestamp),
            data: latestData.data,
          });
        }
      }
    } catch (err) {
      console.error('Error loading latest data:', err);
    }
  };

  const updateConfig = async (newConfig: Partial<ComponentQueryConfig>) => {
    if (!config) return;

    try {
      setIsLoading(true);
      setError(null);

      const updatedConfig = { ...config, ...newConfig };
      
      const response = await fetch(`/api/components/${componentId}/query-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedConfig),
      });

      if (response.ok) {
        setConfig(updatedConfig);
        toast({
          title: 'Configuración actualizada',
          description: 'La configuración del componente se ha guardado',
        });
      } else {
        throw new Error('Failed to update configuration');
      }
    } catch (err) {
      setError('Error updating configuration');
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la configuración',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!config?.sqlQuery.trim()) {
      setError('No SQL query configured');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/components/${componentId}/execute`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadLatestData(); // Recargar datos más recientes
        } else {
          setError(result.error || 'Query execution failed');
        }
      } else {
        throw new Error('Failed to execute query');
      }
    } catch (err) {
      setError('Error executing query');
      console.error('Error executing query:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    loadConfig();
  };

  return {
    config,
    data,
    isLoading,
    error,
    updateConfig,
    executeQuery,
    refetch,
  };
}

// Hook para obtener ejemplos de consultas
export function useExampleQueries() {
  const [examples, setExamples] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadExamples();
  }, []);

  const loadExamples = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/components/example-queries');
      if (response.ok) {
        const data = await response.json();
        setExamples(data);
      }
    } catch (error) {
      console.error('Error loading example queries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { examples, isLoading, refetch: loadExamples };
}

// Hook para probar consultas SQL
export function useQueryTester() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testQuery = async (sqlQuery: string) => {
    if (!sqlQuery.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa una consulta SQL',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      setResult(null);

      const response = await fetch('/api/components/execute-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sqlQuery }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast({
          title: 'Consulta ejecutada',
          description: `Se encontraron ${data.data?.length || 0} registros`,
        });
      } else {
        toast({
          title: 'Error en consulta',
          description: data.error || 'Error desconocido',
          variant: 'destructive',
        });
      }

      return data;
    } catch (error) {
      const errorMessage = 'No se pudo ejecutar la consulta';
      setResult({ success: false, error: errorMessage });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { result, isLoading, testQuery };
}
