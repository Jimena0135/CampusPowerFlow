import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Play, Database, Code, Save, RefreshCw, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ComponentQueryDialogProps {
  componentId: string;
  componentName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface QueryConfig {
  componentId: string;
  sqlQuery: string;
  dataSourceType: 'fiware' | 'custom_sql' | 'simulated';
  refreshInterval: number;
}

interface QueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  columns?: string[];
}

export default function ComponentQueryDialog({ 
  componentId, 
  componentName, 
  isOpen, 
  onClose 
}: ComponentQueryDialogProps) {
  const [config, setConfig] = useState<QueryConfig>({
    componentId,
    sqlQuery: '',
    dataSourceType: 'fiware',
    refreshInterval: 10,
  });
  const [componentInfo, setComponentInfo] = useState({
    name: componentName,
    label: '',
    uniqueIdentifier: '',
    description: '',
  });
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [exampleQueries, setExampleQueries] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("config");
  const { toast } = useToast();

  // Cargar configuración existente
  useEffect(() => {
    if (isOpen && componentId) {
      loadComponentConfig();
      loadExampleQueries();
    }
  }, [isOpen, componentId]);

  const loadComponentConfig = async () => {
    try {
      const response = await fetch(`/api/components/${componentId}/query-config`);
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
      
      // Cargar también información básica del componente
      const componentResponse = await fetch(`/api/electrical-components?buildingId=`);
      if (componentResponse.ok) {
        const components = await componentResponse.json();
        const component = components.find((c: any) => c.id === componentId);
        if (component) {
          setComponentInfo({
            name: component.name,
            label: component.label || '',
            uniqueIdentifier: component.uniqueIdentifier || '',
            description: component.description || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading component config:', error);
    }
  };

  const loadExampleQueries = async () => {
    try {
      const response = await fetch('/api/components/example-queries');
      if (response.ok) {
        const examples = await response.json();
        setExampleQueries(examples);
      }
    } catch (error) {
      console.error('Error loading example queries:', error);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setIsLoading(true);
      
      // Guardar configuración de consulta
      const response = await fetch(`/api/components/${componentId}/query-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      // Guardar información básica del componente
      const componentResponse = await fetch(`/api/components/${componentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(componentInfo),
      });

      if (response.ok && componentResponse.ok) {
        toast({
          title: "Configuración guardada",
          description: "La configuración del componente se ha guardado exitosamente",
        });
      } else {
        throw new Error('Error saving configuration');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestQuery = async () => {
    if (!config.sqlQuery.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una consulta SQL",
        variant: "destructive",
      });
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
        toast({
          title: "Consulta ejecutada",
          description: `Se encontraron ${result.data?.length || 0} registros`,
        });
        setActiveTab("results");
      } else {
        toast({
          title: "Error en consulta",
          description: result.error || "Error desconocido",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo ejecutar la consulta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteComponent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/components/${componentId}/execute`, {
        method: 'POST',
      });

      const result = await response.json();
      setQueryResult(result);

      if (result.success) {
        toast({
          title: "Componente actualizado",
          description: "Los datos del componente se han actualizado",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el componente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Configuración: {componentInfo.name}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config">Configuración</TabsTrigger>
            <TabsTrigger value="query">Consulta SQL</TabsTrigger>
            <TabsTrigger value="examples">Ejemplos</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Componente</Label>
                <Input
                  id="name"
                  value={componentInfo.name}
                  onChange={(e) => setComponentInfo(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uniqueId">Identificador Único</Label>
                <Input
                  id="uniqueId"
                  value={componentInfo.uniqueIdentifier}
                  onChange={(e) => setComponentInfo(prev => ({ ...prev, uniqueIdentifier: e.target.value }))}
                  placeholder="ej: PANEL_SOLAR_01, TRANSF_A1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">Etiqueta Personalizada</Label>
              <Input
                id="label"
                value={componentInfo.label}
                onChange={(e) => setComponentInfo(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Etiqueta que se mostrará en el diagrama"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={componentInfo.description}
                onChange={(e) => setComponentInfo(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del componente"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataSource">Fuente de Datos</Label>
                <Select
                  value={config.dataSourceType}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, dataSourceType: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fiware">FIWARE (Tiempo Real)</SelectItem>
                    <SelectItem value="custom_sql">Consulta SQL Personalizada</SelectItem>
                    <SelectItem value="simulated">Datos Simulados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interval">Intervalo de Actualización (segundos)</Label>
                <Input
                  id="interval"
                  type="number"
                  min="5"
                  max="3600"
                  value={config.refreshInterval}
                  onChange={(e) => setConfig(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) || 10 }))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="query" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sqlQuery">Consulta SQL</Label>
              <Textarea
                id="sqlQuery"
                value={config.sqlQuery}
                onChange={(e) => setConfig(prev => ({ ...prev, sqlQuery: e.target.value }))}
                placeholder="SELECT voltage, current, power FROM ..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleTestQuery} disabled={isLoading} className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Probar Consulta</span>
              </Button>
              <Button onClick={handleExecuteComponent} disabled={isLoading} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Ejecutar para Componente
              </Button>
            </div>

            {config.dataSourceType === 'custom_sql' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Notas sobre Consultas SQL</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Solo se permiten consultas SELECT</li>
                    <li>Para datos FIWARE use tablas con prefijo "mt" o "et"</li>
                    <li>Para datos locales use tablas: electrical_data, environmental_data</li>
                    <li>Los resultados numéricos se almacenan automáticamente</li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="examples" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(exampleQueries).map(([type, query]) => (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="text-sm capitalize flex items-center justify-between">
                      {type.replace('_', ' ')}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfig(prev => ({ ...prev, sqlQuery: query }))}
                      >
                        <Code className="w-4 h-4 mr-1" />
                        Usar
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {query.trim()}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {queryResult ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Resultados de la Consulta</h3>
                  <Badge variant={queryResult.success ? "default" : "destructive"}>
                    {queryResult.success ? "Exitoso" : "Error"}
                  </Badge>
                </div>

                {queryResult.success && queryResult.data ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          {queryResult.columns?.map((col, index) => (
                            <th key={index} className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.data.slice(0, 10).map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-b">
                            {Object.values(row).map((value, colIndex) => (
                              <td key={colIndex} className="px-4 py-2 text-sm text-gray-900">
                                {typeof value === 'number' ? value.toFixed(2) : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {queryResult.data.length > 10 && (
                      <p className="text-sm text-gray-500 mt-2">
                        Mostrando 10 de {queryResult.data.length} registros
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                    <strong>Error:</strong> {queryResult.error}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay resultados para mostrar. Ejecuta una consulta primero.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSaveConfig} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Configuración
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
