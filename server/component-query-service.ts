// Solo conectamos a CrateDB - sin PostgreSQL
import { fiwareConnector } from "./fiware-connector";

interface QueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  columns?: string[];
}

interface ComponentQueryConfig {
  componentId: string;
  sqlQuery: string;
  dataSourceType: 'fiware' | 'custom_sql' | 'simulated';
  refreshInterval: number;
}

export class ComponentQueryService {
  // Ejecutar consulta SQL personalizada de manera segura en CrateDB
  async executeCustomQuery(sqlQuery: string): Promise<QueryResult> {
    try {
      // Validaciones de seguridad básicas
      const normalizedQuery = sqlQuery.trim().toLowerCase();
      
      // Solo permitir SELECT
      if (!normalizedQuery.startsWith('select')) {
        return {
          success: false,
          error: 'Solo se permiten consultas SELECT'
        };
      }

      // Prevenir consultas peligrosas
      const dangerousKeywords = ['drop', 'delete', 'update', 'insert', 'create', 'alter', 'truncate'];
      if (dangerousKeywords.some(keyword => normalizedQuery.includes(keyword))) {
        return {
          success: false,
          error: 'Consulta contiene palabras clave no permitidas'
        };
      }

      // Ejecutar consulta directamente en CrateDB
      const result = await fiwareConnector.executeCustomQuery(sqlQuery);
      
      if (result.success) {
        return {
          success: true,
          data: result.rows || [],
          columns: result.fields?.map((f: any) => f.name) || []
        };
      } else {
        return {
          success: false,
          error: result.error || 'Error ejecutando consulta'
        };
      }

    } catch (error) {
      console.error('Error executing custom query:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Obtener tablas disponibles en CrateDB
  async getAvailableTables(): Promise<string[]> {
    try {
      return await fiwareConnector.getAvailableTables();
    } catch (error) {
      console.error('Error getting available tables:', error);
      return [];
    }
  }

  // Obtener columnas de una tabla
  async getTableColumns(tableName: string): Promise<Array<{name: string, type: string}>> {
    try {
      return await fiwareConnector.getTableColumns(tableName);
    } catch (error) {
      console.error(`Error getting columns for table ${tableName}:`, error);
      return [];
    }
  }

  // Obtener datos de muestra de una tabla
  async getSampleData(tableName: string): Promise<any[]> {
    try {
      return await fiwareConnector.getLatestDataFromTable(tableName, 5);
    } catch (error) {
      console.error(`Error getting sample data from ${tableName}:`, error);
      return [];
    }
  }

  // NOTA: Estos métodos han sido eliminados porque ahora trabajamos solo con CrateDB
  // Las configuraciones de componentes se manejan desde el frontend directamente
  async getComponentQueryConfig(componentId: string): Promise<ComponentQueryConfig | null> {
    console.warn('getComponentQueryConfig: Configuración debe manejarse desde el frontend - solo CrateDB');
    return null;
  }

  async updateComponentQueryConfig(
    componentId: string, 
    config: Partial<ComponentQueryConfig>
  ): Promise<boolean> {
    console.warn('updateComponentQueryConfig: Configuración debe manejarse desde el frontend - solo CrateDB');
    return false;
  }

  // Ejecutar consulta específica y devolver resultados directamente (sin almacenar en PostgreSQL)
  async executeComponentQuery(componentId: string, customQuery?: string): Promise<QueryResult> {
    try {
      if (!customQuery) {
        return {
          success: false,
          error: 'No hay consulta configurada para este componente'
        };
      }

      // Ejecutar la consulta directamente en CrateDB
      const result = await this.executeCustomQuery(customQuery);
      return result;
    } catch (error) {
      console.error('Error executing component query:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Método eliminado - no almacenamos en PostgreSQL
  private async storeComponentData(componentId: string, queryResults: any[]): Promise<void> {
    console.warn('storeComponentData: Ya no almacenamos en PostgreSQL - solo leemos de CrateDB');
  }

  // Obtener datos directamente de CrateDB (sin PostgreSQL intermedio)
  async getLatestComponentData(componentId: string, tableName: string): Promise<Record<string, any>> {
    try {
      const query = `
        SELECT * FROM "${tableName}"
        WHERE entity_id = '${componentId}'
        ORDER BY time_index DESC
        LIMIT 1
      `;
      
      const result = await this.executeCustomQuery(query);
      
      if (result.success && result.data && result.data.length > 0) {
        return result.data[0];
      }
      
      return {};
    } catch (error) {
      console.error('Error getting latest component data:', error);
      return {};
    }
  }

  // Generar consultas de ejemplo para diferentes tipos de componentes
  getExampleQueries(): Record<string, string> {
    return {
      'smart_meter': `
        SELECT 
          time_index, voltage, current, power, power_factor, frequency 
        FROM etsmartmeter 
        ORDER BY time_index DESC 
        LIMIT 10
      `,
      'battery_monitor': `
        SELECT 
          time_index, soc, voltage, current, temperature 
        FROM etbattmon_combox 
        ORDER BY time_index DESC 
        LIMIT 10
      `,
      'weather_station': `
        SELECT 
          time_index, temperature, humidity 
        FROM etweatherstation 
        ORDER BY time_index DESC 
        LIMIT 10
      `,
      'solar_panel_enphase': `
        SELECT 
          time_index, dc_power, ac_power, efficiency 
        FROM etenphaseinverter 
        ORDER BY time_index DESC 
        LIMIT 10
      `,
      'solar_panel_fronius': `
        SELECT 
          time_index, dc_power, ac_power, efficiency 
        FROM etfroniusinverter 
        ORDER BY time_index DESC 
        LIMIT 10
      `,
      'inverter_xw': `
        SELECT 
          time_index, ac_voltage, ac_current, dc_voltage, dc_current 
        FROM etinverterxw 
        ORDER BY time_index DESC 
        LIMIT 10
      `,
      'sensor_card': `
        SELECT 
          time_index, temperature, voltage, current 
        FROM etfroniussensorcard 
        ORDER BY time_index DESC 
        LIMIT 10
      `
    };
  }
}

export const componentQueryService = new ComponentQueryService();
