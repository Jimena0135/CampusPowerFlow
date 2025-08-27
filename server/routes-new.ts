import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { fiwareConnector } from "./fiware-connector";
import { componentQueryService } from "./component-query-service";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Dashboard APIs - Solo CrateDB
  app.get("/api/dashboard/tables", async (req, res) => {
    try {
      const tables = await componentQueryService.getAvailableTables();
      res.json({ success: true, tables });
    } catch (error) {
      console.error('Error getting tables:', error);
      res.status(500).json({ success: false, error: "Failed to get tables" });
    }
  });

  app.get("/api/dashboard/tables/:tableName/columns", async (req, res) => {
    try {
      const { tableName } = req.params;
      const columns = await componentQueryService.getTableColumns(tableName);
      res.json({ success: true, columns });
    } catch (error) {
      console.error('Error getting table columns:', error);
      res.status(500).json({ success: false, error: "Failed to get table columns" });
    }
  });

  app.get("/api/dashboard/tables/:tableName/sample", async (req, res) => {
    try {
      const { tableName } = req.params;
      const sampleData = await componentQueryService.getSampleData(tableName);
      res.json({ success: true, data: sampleData });
    } catch (error) {
      console.error('Error getting sample data:', error);
      res.status(500).json({ success: false, error: "Failed to get sample data" });
    }
  });

  app.post("/api/dashboard/query", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ success: false, error: "Query is required" });
      }
      
      const result = await componentQueryService.executeCustomQuery(query);
      res.json(result);
    } catch (error) {
      console.error('Error executing dashboard query:', error);
      res.status(500).json({ success: false, error: "Failed to execute query" });
    }
  });

  // Component Data API - Solo CrateDB
  app.get("/api/components/:componentId/data", async (req, res) => {
    try {
      const { componentId } = req.params;
      const { tableName } = req.query;
      
      if (!tableName) {
        return res.status(400).json({ success: false, error: "tableName query parameter is required" });
      }
      
      const data = await componentQueryService.getLatestComponentData(componentId, tableName as string);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error getting component data:', error);
      res.status(500).json({ success: false, error: "Failed to get component data" });
    }
  });

  // Query Examples API
  app.get("/api/query-examples", async (req, res) => {
    try {
      const examples = {
        "Smart Meter - Últimos datos": "SELECT * FROM etsmartmeter ORDER BY time_index DESC LIMIT 10",
        "Smart Meter - Promedio por hora": "SELECT DATE_TRUNC('hour', time_index) as hour, AVG(voltage) as avg_voltage, AVG(current) as avg_current, AVG(power) as avg_power FROM etsmartmeter WHERE time_index >= NOW() - INTERVAL '24 hours' GROUP BY hour ORDER BY hour DESC",
        "Gestión de Baterías": "SELECT * FROM etbattmon_combox ORDER BY time_index DESC LIMIT 10",
        "Estación Meteorológica": "SELECT * FROM etweatherstation ORDER BY time_index DESC LIMIT 10",
        "Sistema Fotovoltaico Enphase": "SELECT * FROM etenphaseinverter ORDER BY time_index DESC LIMIT 10",
        "Sistema Fotovoltaico Fronius": "SELECT * FROM etfroniusinverter ORDER BY time_index DESC LIMIT 10"
      };
      
      res.json({ success: true, examples });
    } catch (error) {
      console.error('Error getting query examples:', error);
      res.status(500).json({ success: false, error: "Failed to get query examples" });
    }
  });

  // WebSocket para datos en tiempo real
  const wss = new WebSocketServer({ server: httpServer });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    
    ws.on('message', (data: string) => {
      try {
        console.log('Received WebSocket message:', data);
        const message = JSON.parse(data);
        
        if (message.type === 'subscribe') {
          // Suscribirse a actualizaciones de datos específicos
          ws.send(JSON.stringify({
            type: 'subscribed',
            message: `Subscribed to ${message.componentId} updates`
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  console.log('Routes registered - Only CrateDB connection');
  return httpServer;
}
