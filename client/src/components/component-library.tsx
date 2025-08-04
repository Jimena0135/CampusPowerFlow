import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ComponentLibrary() {
  const [activeTab, setActiveTab] = useState<"symbols" | "blocks">("symbols");
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
    { name: "Transformador", symbol: "⚡", category: "Generación y Distribución" },
    { name: "Interruptor", symbol: "↗", category: "Generación y Distribución" },
    { name: "Fusible", symbol: "—•—", category: "Generación y Distribución" },
    { name: "Motor", symbol: "M", category: "Generación y Distribución" },
    { name: "Generador", symbol: "G", category: "Generación y Distribución" },
    { name: "Tierra", symbol: "⏚", category: "Generación y Distribución" },
    { name: "Voltímetro", symbol: "V", category: "Instrumentos de Medición" },
    { name: "Amperímetro", symbol: "A", category: "Instrumentos de Medición" },
    { name: "Wattímetro", symbol: "W", category: "Instrumentos de Medición" },
  ];

  const categories = Array.from(new Set(electricalComponents.map(c => c.category)));

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Librería de Componentes</h2>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === "symbols" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("symbols")}
            className="flex-1"
          >
            Símbolos NTC2050
          </Button>
          <Button
            variant={activeTab === "blocks" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("blocks")}
            className="flex-1"
          >
            Bloques
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "symbols" && (
          <div className="space-y-4">
            {categories.map(category => (
              <div key={category}>
                <h3 className="text-sm font-medium text-gray-700 mb-2">{category}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {electricalComponents
                    .filter(component => component.category === category)
                    .map(component => (
                      <Card 
                        key={component.name}
                        className="p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
                        title={component.name}
                      >
                        <CardContent className="p-0">
                          <div className="w-full h-8 flex items-center justify-center">
                            <span className="text-xl text-gray-600">{component.symbol}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 text-center">{component.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === "blocks" && (
          <div className="space-y-2">
            <Card className="p-3 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors">
              <CardContent className="p-0">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-200 rounded mx-auto mb-2 flex items-center justify-center">
                    <span className="text-blue-600 font-bold">A</span>
                  </div>
                  <p className="text-xs text-gray-600">Bloque Ingeniería</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-3 bg-green-50 hover:bg-green-100 cursor-pointer transition-colors">
              <CardContent className="p-0">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-200 rounded mx-auto mb-2 flex items-center justify-center">
                    <span className="text-green-600 font-bold">B</span>
                  </div>
                  <p className="text-xs text-gray-600">Bloque Administrativo</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-3 bg-orange-50 hover:bg-orange-100 cursor-pointer transition-colors">
              <CardContent className="p-0">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-200 rounded mx-auto mb-2 flex items-center justify-center">
                    <span className="text-orange-600 font-bold">C</span>
                  </div>
                  <p className="text-xs text-gray-600">Bloque Laboratorios</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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
