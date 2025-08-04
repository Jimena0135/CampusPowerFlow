import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertBuildingSchema, insertElectricalDataSchema, insertEnvironmentalDataSchema, insertAlertSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Buildings API
  app.get("/api/buildings", async (req, res) => {
    try {
      const buildings = await storage.getAllBuildings();
      res.json(buildings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch buildings" });
    }
  });

  app.get("/api/buildings/:id", async (req, res) => {
    try {
      const building = await storage.getBuilding(req.params.id);
      if (!building) {
        return res.status(404).json({ error: "Building not found" });
      }
      res.json(building);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch building" });
    }
  });

  app.post("/api/buildings", async (req, res) => {
    try {
      const buildingData = insertBuildingSchema.parse(req.body);
      const building = await storage.createBuilding(buildingData);
      res.status(201).json(building);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create building" });
    }
  });

  // Electrical data API
  app.get("/api/buildings/:buildingId/electrical-data/latest", async (req, res) => {
    try {
      const data = await storage.getLatestElectricalData(req.params.buildingId);
      if (!data) {
        return res.status(404).json({ error: "No electrical data found" });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch electrical data" });
    }
  });

  app.get("/api/buildings/:buildingId/electrical-data/history", async (req, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const data = await storage.getElectricalDataHistory(req.params.buildingId, hours);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch electrical data history" });
    }
  });

  app.post("/api/electrical-data", async (req, res) => {
    try {
      const electricalData = insertElectricalDataSchema.parse(req.body);
      const data = await storage.createElectricalData(electricalData);
      
      // Broadcast to all WebSocket clients
      broadcastElectricalData(data);
      
      res.status(201).json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create electrical data" });
    }
  });

  // Environmental data API
  app.get("/api/buildings/:buildingId/environmental-data/latest", async (req, res) => {
    try {
      const data = await storage.getLatestEnvironmentalData(req.params.buildingId);
      if (!data) {
        return res.status(404).json({ error: "No environmental data found" });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch environmental data" });
    }
  });

  app.post("/api/environmental-data", async (req, res) => {
    try {
      const environmentalData = insertEnvironmentalDataSchema.parse(req.body);
      const data = await storage.createEnvironmentalData(environmentalData);
      
      // Broadcast to all WebSocket clients
      broadcastEnvironmentalData(data);
      
      res.status(201).json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create environmental data" });
    }
  });

  // Alerts API
  app.get("/api/alerts", async (req, res) => {
    try {
      const buildingId = req.query.buildingId as string;
      const alerts = await storage.getActiveAlerts(buildingId);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const alertData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(alertData);
      
      // Broadcast alert to all WebSocket clients
      broadcastAlert(alert);
      
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create alert" });
    }
  });

  // Electrical components API
  app.get("/api/electrical-components", async (req, res) => {
    try {
      const buildingId = req.query.buildingId as string;
      const components = await storage.getElectricalComponents(buildingId);
      res.json(components);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch electrical components" });
    }
  });

  // SQL Query endpoint for custom queries
  app.post("/api/sql-query", async (req, res) => {
    try {
      const { query } = req.body;
      
      // Basic validation for safety (in production, use a proper SQL validator)
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Invalid query" });
      }

      // For security, only allow SELECT statements
      if (!query.trim().toLowerCase().startsWith("select")) {
        return res.status(403).json({ error: "Only SELECT queries are allowed" });
      }

      // Execute the query (this is a simplified example)
      // In production, use proper query execution with parameter binding
      res.json({ 
        message: "SQL query execution would be implemented here",
        query: query,
        note: "For demonstration purposes only"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to execute query" });
    }
  });

  // WebSocket setup for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        console.log('Received WebSocket message:', data);
        
        // Handle different message types
        if (data.type === 'subscribe') {
          // Handle subscription to specific building data
          ws.send(JSON.stringify({ 
            type: 'subscription_confirmed', 
            buildingId: data.buildingId 
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({ 
      type: 'connection_established', 
      timestamp: new Date().toISOString() 
    }));
  });

  // Broadcast functions
  function broadcastElectricalData(data: any) {
    const message = JSON.stringify({
      type: 'electrical_data_update',
      data: data
    });
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  function broadcastEnvironmentalData(data: any) {
    const message = JSON.stringify({
      type: 'environmental_data_update',
      data: data
    });
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  function broadcastAlert(alert: any) {
    const message = JSON.stringify({
      type: 'alert_update',
      data: alert
    });
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Simulate real-time data generation for demonstration
  setInterval(async () => {
    try {
      const buildings = await storage.getAllBuildings();
      
      for (const building of buildings) {
        // Generate random electrical data
        const electricalData = {
          buildingId: building.id,
          voltage: 450 + Math.random() * 20, // 450-470V
          current: 100 + Math.random() * 100, // 100-200A
          power: 45 + Math.random() * 50, // 45-95kW
          powerFactor: 0.8 + Math.random() * 0.2, // 0.8-1.0
          frequency: 59.8 + Math.random() * 0.4, // 59.8-60.2Hz
          thd: Math.random() * 5, // 0-5% THD
        };
        
        // Generate random environmental data
        const environmentalData = {
          buildingId: building.id,
          temperature: 20 + Math.random() * 10, // 20-30°C
          humidity: 40 + Math.random() * 30, // 40-70%
          illumination: 250 + Math.random() * 100, // 250-350 lux
        };
        
        await storage.createElectricalData(electricalData);
        await storage.createEnvironmentalData(environmentalData);
        
        broadcastElectricalData(electricalData);
        broadcastEnvironmentalData(environmentalData);
      }
    } catch (error) {
      console.error('Error generating simulated data:', error);
    }
  }, 5000); // Update every 5 seconds

  return httpServer;
}
