import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ComponentLibrary() {
  const [sqlQuery, setSqlQuery] = useState("SELECT voltage, current, power FROM electrical_data WHERE building_id = 'BLOQUE_A' ORDER BY timestamp DESC LIMIT 10");
  const { toast } = useToast();

  const handleExecuteQuery = async () => {
    try {
      const response = await apiRequest("POST", "/api/sql-query", { query: sqlQuery });
      const result = await response.json();
      
      toast({
        title: "Consulta ejecutada",
        description: result.message || "Consulta SQL procesada exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al ejecutar la consulta SQL",
        variant: "destructive",
      });
    }
  };

  const electricalComponents = [
    { name: "Carga", symbol: "🏢", category: "Cargas Eléctricas", id: "load" },
    { name: "Transformador", symbol: "⚡", category: "Equipos de Potencia", id: "transformer" },
    { name: "Inversor", symbol: "〜", category: "Equipos de Potencia", id: "inverter" },
    { name: "Panel Solar", symbol: "☀", category: "Generación Renovable", id: "solar_panel" },
    { name: "Batería", symbol: "🔋", category: "Almacenamiento", id: "battery" },
    { name: "Biodigestor", symbol: "🌱", category: "Generación Renovable", id: "biodigester" },
    { name: "Barra", symbol: "━", category: "Distribución", id: "busbar" },
  ];

  const categories = Array.from(new Set(electricalComponents.map(c => c.category)));

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Librería de Componentes</h2>
        <div className="text-center">
          <span className="text-sm font-medium text-gray-600">Símbolos NTC2050</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-700 mb-2">{category}</h3>
              <div className="grid grid-cols-2 gap-2">
                {electricalComponents
                  .filter(component => component.category === category)
                  .map(component => (
                    <div 
                      key={component.id}
                      className="p-3 bg-white hover:bg-gray-50 cursor-grab active:cursor-grabbing border border-gray-200 rounded-lg transition-colors"
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify({
                          type: 'component',
                          componentId: component.id,
                          componentName: component.name,
                          componentSymbol: component.symbol
                        }));
                      }}
                      title={`Arrastrar ${component.name} al diagrama`}
                    >
                      <div className="w-full h-8 flex items-center justify-center">
                        <span className="text-xl text-gray-700">{component.symbol}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 text-center">{component.name}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* SQL Query Panel */}
      <div className="border-t border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Consulta SQL</h3>
        <Textarea
          value={sqlQuery}
          onChange={(e) => setSqlQuery(e.target.value)}
          className="h-20 text-xs font-mono resize-none"
          placeholder="SELECT voltage, current, power FROM electrical_data WHERE building_id = 'BLOQUE_A' ORDER BY timestamp DESC LIMIT 10"
        />
        <Button 
          onClick={handleExecuteQuery}
          className="w-full mt-2 bg-green-600 hover:bg-green-700"
          size="sm"
        >
          <Play className="w-4 h-4 mr-1" />
          Ejecutar Consulta
        </Button>
      </div>
    </div>
  );
}
