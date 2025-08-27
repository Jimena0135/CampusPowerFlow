import pkg from 'pg';
import type { Client as PgClient } from 'pg';
const { Client } = pkg;

interface FiwareConfig {
  orionUrl: string;
  crateUrl: string;
  crateHost: string;
  cratePort: number;
  fiwareService: string;
  fiwareServicePath: string;
}

export class FiwareConnector {
  private config: FiwareConfig;
  private crateClient: PgClient;
  private isConnected: boolean = false;

  constructor() {
    this.config = {
      orionUrl: process.env.ORION_URL || 'http://orion-plataforma:1026',
      crateUrl: process.env.CRATE_URL || 'http://crate-db:4200',
      crateHost: process.env.CRATE_HOST || 'crate-db',
      cratePort: parseInt(process.env.CRATE_PORT || '5432'),
      fiwareService: process.env.FIWARE_SERVICE || 'sec',
      fiwareServicePath: process.env.FIWARE_SERVICEPATH || '/',
    };

    // Cliente para CrateDB (series de tiempo)
    this.crateClient = new Client({
      host: this.config.crateHost,
      port: this.config.cratePort,
      user: 'crate',
      database: 'doc',
    });
  }

  async connect() {
    if (this.isConnected) {
      console.log('CrateDB client already connected');
      return;
    }

    try {
      await this.crateClient.connect();
      this.isConnected = true;
      console.log('Connected to CrateDB for time series data');
    } catch (error) {
      console.error('Error connecting to CrateDB:', error);
      this.isConnected = false;
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await this.crateClient.end();
      this.isConnected = false;
    }
  }

  // Obtener entidades desde Orion Context Broker
  async getOrionEntities(entityType?: string): Promise<any[]> {
    try {
      let url = `${this.config.orionUrl}/v2/entities`;
      if (entityType) {
        url += `?type=${entityType}`;
      }

      const response = await fetch(url, {
        headers: {
          'fiware-service': this.config.fiwareService,
          'fiware-servicepath': this.config.fiwareServicePath,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching entities from Orion:', error);
      return [];
    }
  }

  // Obtener datos históricos de CrateDB (usando tablas directas)
  async getTimeSeriesData(
    tableName: string, 
    attributeName: string, 
    hoursBack: number = 24
  ): Promise<any[]> {
    try {
      const query = `
        SELECT time_index, ${attributeName}
        FROM ${tableName}
        WHERE time_index >= NOW() - INTERVAL '${hoursBack}' HOUR
        ORDER BY time_index DESC
        LIMIT 1000
      `;

      const result = await this.crateClient.query(query);
      return result.rows;
    } catch (error) {
      console.error(`Error querying time series data for ${tableName}:`, error);
      return [];
    }
  }

  // Obtener último valor de un atributo (usando tablas directas)
  async getLatestValue(tableName: string, attributeName: string): Promise<any> {
    try {
      const query = `
        SELECT time_index, ${attributeName}
        FROM ${tableName}
        ORDER BY time_index DESC
        LIMIT 1
      `;

      const result = await this.crateClient.query(query);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error getting latest value for ${tableName}.${attributeName}:`, error);
      return null;
    }
  }

  // Mapear datos de FIWARE a formato Unifilar
  async getElectricalDataForBuilding(buildingId: string): Promise<any> {
    try {
      // Mapeo de IDs de edificios a entidades FIWARE
      const entityMapping: Record<string, string> = {
        'BLOQUE_A': 'SmartMeter_BLOQUE_A',
        'BLOQUE_B': 'SmartMeter_BLOQUE_B', 
        'BLOQUE_C': 'SmartMeter_BLOQUE_C',
      };

      const entityId = entityMapping[buildingId];
      if (!entityId) {
        console.warn(`No entity mapping found for building ${buildingId}`);
        return null;
      }

      // Obtener datos eléctricos más recientes
      const [voltage, current, power, powerFactor, frequency] = await Promise.all([
        this.getLatestValue(entityId, 'voltage'),
        this.getLatestValue(entityId, 'current'),
        this.getLatestValue(entityId, 'power'),
        this.getLatestValue(entityId, 'power_factor'),
        this.getLatestValue(entityId, 'frequency'),
      ]);

      return {
        buildingId,
        voltage: voltage?.voltage || 220,
        current: current?.current || 10,
        power: power?.power || 2200,
        powerFactor: powerFactor?.power_factor || 0.9,
        frequency: frequency?.frequency || 60,
        thd: 2.5, // Valor por defecto
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Error getting electrical data for building ${buildingId}:`, error);
      return null;
    }
  }

  // Obtener datos ambientales
  async getEnvironmentalDataForBuilding(buildingId: string): Promise<any> {
    try {
      const entityMapping: Record<string, string> = {
        'BLOQUE_A': 'WeatherStation_A',
        'BLOQUE_B': 'WeatherStation_B',
        'BLOQUE_C': 'WeatherStation_C',
      };

      const entityId = entityMapping[buildingId];
      if (!entityId) {
        return null;
      }

      const [temperature, humidity] = await Promise.all([
        this.getLatestValue(entityId, 'temperature'),
        this.getLatestValue(entityId, 'humidity'),
      ]);

      return {
        buildingId,
        temperature: temperature?.temperature || 25,
        humidity: humidity?.humidity || 60,
        illumination: 300, // Valor por defecto
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Error getting environmental data for building ${buildingId}:`, error);
      return null;
    }
  }

  // Ejecutar consulta personalizada en CrateDB
  async executeCustomQuery(sqlQuery: string): Promise<any> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      const result = await this.crateClient.query(sqlQuery);
      return {
        success: true,
        rows: result.rows,
        fields: result.fields,
        rowCount: result.rowCount
      };
    } catch (error) {
      console.error('Error executing custom query in CrateDB:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        rows: [],
        fields: []
      };
    }
  }

  // Obtener todas las tablas disponibles en CrateDB
  async getAvailableTables(): Promise<string[]> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      const result = await this.crateClient.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'doc' 
        AND table_name LIKE 'et%'
        ORDER BY table_name
      `);
      return result.rows.map((row: any) => row.table_name);
    } catch (error) {
      console.error('Error getting available tables:', error);
      return [];
    }
  }

  // Obtener columnas de una tabla específica
  async getTableColumns(tableName: string): Promise<Array<{name: string, type: string}>> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      const result = await this.crateClient.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${tableName}' 
        AND table_schema = 'doc'
        ORDER BY ordinal_position
      `);
      return result.rows.map((row: any) => ({
        name: row.column_name,
        type: row.data_type
      }));
    } catch (error) {
      console.error(`Error getting columns for table ${tableName}:`, error);
      return [];
    }
  }

  // Obtener datos más recientes de una tabla
  async getLatestDataFromTable(tableName: string, limit: number = 10): Promise<any[]> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      const result = await this.crateClient.query(`
        SELECT * FROM "${tableName}"
        ORDER BY time_index DESC
        LIMIT ${limit}
      `);
      return result.rows;
    } catch (error) {
      console.error(`Error getting latest data from ${tableName}:`, error);
      return [];
    }
  }

  // Suscribirse a cambios en Orion (para futuras implementaciones)
  async subscribeToChanges(entityId: string, callback: (data: any) => void) {
    // Implementar suscripción a cambios usando Orion subscriptions
    // Por ahora, usar polling como fallback
    console.log(`Subscription to ${entityId} not implemented yet`);
  }
}

export const fiwareConnector = new FiwareConnector();
