import { useState, useEffect } from "react";
import { X, Plus, Settings, Trash2, BarChart3, LineChart, PieChart, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Dashboard, DashboardWidget } from "@shared/schema";

interface DynamicDashboardProps {
  componentId?: string;
  onClose: () => void;
}

interface WidgetData {
  id: string;
  data: any[];
  loading: boolean;
  error: string | null;
}

export default function DynamicDashboard({ componentId, onClose }: DynamicDashboardProps) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [widgetData, setWidgetData] = useState<Record<string, WidgetData>>({});
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);

  // Nuevo widget form
  const [newWidget, setNewWidget] = useState({
    type: 'chart',
    title: '',
    dataSource: 'crate',
    sqlQuery: '',
    chartType: 'line',
    width: 2,
    height: 1,
    refreshInterval: 30
  });

  useEffect(() => {
    loadDashboard();
  }, [componentId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const loadDashboard = async () => {
    try {
      const response = await fetch(`/api/dashboards${componentId ? `?componentId=${componentId}` : ''}`);
      if (response.ok) {
        const data = await response.json();
        setDashboard(data.dashboard);
        setWidgets(data.widgets || []);
        
        // Cargar datos de cada widget
        data.widgets?.forEach((widget: DashboardWidget) => {
          loadWidgetData(widget);
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadWidgetData = async (widget: DashboardWidget) => {
    if (!widget.sqlQuery) return;

    setWidgetData(prev => ({
      ...prev,
      [widget.id]: { id: widget.id, data: [], loading: true, error: null }
    }));

    try {
      const response = await fetch('/api/widgets/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: widget.sqlQuery,
          dataSource: widget.dataSource
        })
      });

      if (response.ok) {
        const result = await response.json();
        setWidgetData(prev => ({
          ...prev,
          [widget.id]: { 
            id: widget.id, 
            data: result.data || [], 
            loading: false, 
            error: null 
          }
        }));
      } else {
        const error = await response.text();
        setWidgetData(prev => ({
          ...prev,
          [widget.id]: { 
            id: widget.id, 
            data: [], 
            loading: false, 
            error 
          }
        }));
      }
    } catch (error) {
      setWidgetData(prev => ({
        ...prev,
        [widget.id]: { 
          id: widget.id, 
          data: [], 
          loading: false, 
          error: error instanceof Error ? error.message : 'Error desconocido' 
        }
      }));
    }
  };

  const createWidget = async () => {
    try {
      const response = await fetch('/api/dashboard-widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newWidget,
          dashboardId: dashboard?.id,
          position: widgets.length
        })
      });

      if (response.ok) {
        const widget = await response.json();
        setWidgets(prev => [...prev, widget]);
        loadWidgetData(widget);
        setIsAddingWidget(false);
        setNewWidget({
          type: 'chart',
          title: '',
          dataSource: 'crate',
          sqlQuery: '',
          chartType: 'line',
          width: 2,
          height: 1,
          refreshInterval: 30
        });
      }
    } catch (error) {
      console.error('Error creating widget:', error);
    }
  };

  const deleteWidget = async (widgetId: string) => {
    try {
      const response = await fetch(`/api/dashboard-widgets/${widgetId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setWidgets(prev => prev.filter(w => w.id !== widgetId));
        setWidgetData(prev => {
          const newData = { ...prev };
          delete newData[widgetId];
          return newData;
        });
      }
    } catch (error) {
      console.error('Error deleting widget:', error);
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    const data = widgetData[widget.id];
    
    return (
      <Card key={widget.id} className={`col-span-${widget.width} row-span-${widget.height}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadWidgetData(widget)}
              disabled={data?.loading}
            >
              🔄
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingWidget(widget)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteWidget(widget.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data?.loading && (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {data?.error && (
            <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
              Error: {data.error}
            </div>
          )}
          
          {data?.data && !data.loading && !data.error && (
            <div>
              {widget.type === 'metric' && renderMetricWidget(widget, data.data)}
              {widget.type === 'chart' && renderChartWidget(widget, data.data)}
              {widget.type === 'table' && renderTableWidget(widget, data.data)}
              {widget.type === 'gauge' && renderGaugeWidget(widget, data.data)}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderMetricWidget = (widget: DashboardWidget, data: any[]) => {
    const value = data[0] || {};
    const columns = JSON.parse(widget.dataColumns || '[]');
    const primaryColumn = columns[0] || Object.keys(value)[0];
    
    return (
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600">
          {value[primaryColumn] || 'N/A'}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {widget.title}
        </div>
      </div>
    );
  };

  const renderChartWidget = (widget: DashboardWidget, data: any[]) => {
    // Aquí integrarías una librería de gráficos como Chart.js o Recharts
    return (
      <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
        <div className="text-center text-gray-500">
          <BarChart3 className="w-8 h-8 mx-auto mb-2" />
          <div className="text-sm">Gráfico {widget.chartType}</div>
          <div className="text-xs">{data.length} registros</div>
        </div>
      </div>
    );
  };

  const renderTableWidget = (widget: DashboardWidget, data: any[]) => {
    if (data.length === 0) return <div>No hay datos</div>;
    
    const columns = Object.keys(data[0]);
    
    return (
      <div className="max-h-32 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b">
              {columns.map(col => (
                <th key={col} className="text-left p-1">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 5).map((row, idx) => (
              <tr key={idx} className="border-b">
                {columns.map(col => (
                  <td key={col} className="p-1">{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderGaugeWidget = (widget: DashboardWidget, data: any[]) => {
    const value = data[0] || {};
    const columns = JSON.parse(widget.dataColumns || '[]');
    const primaryColumn = columns[0] || Object.keys(value)[0];
    const val = parseFloat(value[primaryColumn]) || 0;
    
    return (
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#3b82f6"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${val * 2.51} 251`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{val.toFixed(1)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              {dashboard?.name || 'Dashboard'}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingWidget(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Widget
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className={`grid grid-cols-4 gap-4 auto-rows-min`}>
            {widgets.map(renderWidget)}
          </div>
        </div>
      </div>

      {/* Add Widget Dialog */}
      <Dialog open={isAddingWidget} onOpenChange={setIsAddingWidget}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Widget</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newWidget.title}
                onChange={(e) => setNewWidget(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título del widget"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={newWidget.type}
                onValueChange={(value) => setNewWidget(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Métrica</SelectItem>
                  <SelectItem value="chart">Gráfico</SelectItem>
                  <SelectItem value="table">Tabla</SelectItem>
                  <SelectItem value="gauge">Medidor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dataSource">Fuente de Datos</Label>
              <Select
                value={newWidget.dataSource}
                onValueChange={(value) => setNewWidget(prev => ({ ...prev, dataSource: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crate">CrateDB</SelectItem>
                  <SelectItem value="postgres">PostgreSQL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newWidget.type === 'chart' && (
              <div>
                <Label htmlFor="chartType">Tipo de Gráfico</Label>
                <Select
                  value={newWidget.chartType}
                  onValueChange={(value) => setNewWidget(prev => ({ ...prev, chartType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Líneas</SelectItem>
                    <SelectItem value="bar">Barras</SelectItem>
                    <SelectItem value="area">Área</SelectItem>
                    <SelectItem value="pie">Circular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="col-span-2">
              <Label htmlFor="sqlQuery">Consulta SQL</Label>
              <Textarea
                id="sqlQuery"
                value={newWidget.sqlQuery}
                onChange={(e) => setNewWidget(prev => ({ ...prev, sqlQuery: e.target.value }))}
                placeholder="SELECT * FROM etsmartmeter ORDER BY time_index DESC LIMIT 10"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="width">Ancho (columnas)</Label>
              <Input
                id="width"
                type="number"
                min="1"
                max="4"
                value={newWidget.width}
                onChange={(e) => setNewWidget(prev => ({ ...prev, width: parseInt(e.target.value) }))}
              />
            </div>

            <div>
              <Label htmlFor="height">Alto (filas)</Label>
              <Input
                id="height"
                type="number"
                min="1"
                max="3"
                value={newWidget.height}
                onChange={(e) => setNewWidget(prev => ({ ...prev, height: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddingWidget(false)}>
              Cancelar
            </Button>
            <Button onClick={createWidget} disabled={!newWidget.title || !newWidget.sqlQuery}>
              Crear Widget
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
