import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { SolarPanelIcon, TransformerIcon } from "./icons";
import { BarraColectora, GeneradorSolar, TransformadorCircular, CargaFlecha, Bateria, BateriaInversor } from "./simbolos-tecnicos";

import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ComponentLibraryProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function ComponentLibrary({ isOpen, onToggle }: ComponentLibraryProps) {
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
    { name: "Transformador Circular", symbol: <TransformadorCircular size={28} />, category: "Transformadores", id: "transformador_circular" },
    { name: "Generador Solar", symbol: <GeneradorSolar size={28} />, category: "Generadores y Cargas", id: "generador_solar" },
    { name: "Batería", symbol: <Bateria size={28} />, category: "Generadores y Cargas", id: "bateria" },
    { name: "Batería con Inversor", symbol: <BateriaInversor size={28} />, category: "Generadores y Cargas", id: "bateria_inversor" },
    { name: "Carga (Flecha)", symbol: <CargaFlecha size={28} />, category: "Generadores y Cargas", id: "carga_flecha" },
    { name: "Barra Colectora", symbol: <BarraColectora width={28} height={8} />, category: "Distribución Técnica", id: "barra_colectora" },
  ];

  const categories = Array.from(new Set(electricalComponents.map(c => c.category)));

  return (
    <div className="w-full bg-white border-r border-gray-200 flex flex-col h-full">
      {isOpen ? (
        // Vista completa
        <>
          {/* Header con botón de colapsar */}
          <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">Librería de Componentes</h2>
                <div className="text-center">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">Símbolos NTC2050</span>
                </div>
              </div>
              {onToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="p-2 hover:bg-gray-100"
                  title="Minimizar librería"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
      
      {/* Área de componentes con scroll */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="space-y-3 sm:space-y-4">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sticky top-0 bg-white py-1 z-10">
                {category}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {electricalComponents
                  .filter(component => component.category === category)
                  .map(component => (
                    <div 
                      key={component.id}
                      className="p-2 sm:p-3 bg-white hover:bg-gray-50 cursor-grab active:cursor-grabbing border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-md hover:border-blue-300"
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify({
                          type: 'component',
                          componentId: component.id,
                          componentName: component.name
                        }));
                      }}
                      title={`Arrastrar ${component.name} al diagrama`}
                    >
                      <div className="w-full flex items-center justify-center">
                        <div className="bg-white border border-gray-300 rounded flex items-center justify-center mx-auto" style={{ width: 36, height: 36 }}>
                          {/* Renderiza el símbolo react-konva para previsualización */}
                          {component.symbol}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 text-center truncate">{component.name}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
          </div>
        </>
      ) : (
        // Vista minimizada - barra lateral pequeña con texto vertical
        <div className="w-full h-full flex flex-col bg-gray-50">
          {/* Botón para expandir en la parte superior */}
          <div className="flex justify-center p-2 border-b border-gray-200">
            {onToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="Expandir librería"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {/* Texto vertical */}
          <div className="flex-1 flex items-center justify-center py-4">
            <div className="transform -rotate-90 whitespace-nowrap">
              <span className="text-sm font-medium text-gray-700">
                Librería de Componentes
              </span>
            </div>
          </div>
          
          {/* Iconos de categorías minimizados */}
          <div className="flex flex-col items-center space-y-3 p-3 border-t border-gray-200">
            <div 
              className="w-3 h-3 bg-blue-500 rounded" 
              title="Componentes de Control"
            ></div>
            <div 
              className="w-3 h-3 bg-green-500 rounded-full" 
              title="Componentes de Potencia"
            ></div>
            <div 
              className="w-3 h-3 bg-yellow-500 rounded" 
              title="Instrumentos"
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
