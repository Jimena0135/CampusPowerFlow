import { 
  users,
  buildings, 
  electricalData, 
  environmentalData, 
  alerts, 
  electricalComponents,
  type Building, 
  type InsertBuilding,
  type ElectricalData,
  type InsertElectricalData,
  type EnvironmentalData,
  type InsertEnvironmentalData,
  type Alert,
  type InsertAlert,
  type ElectricalComponent,
  type InsertElectricalComponent,
  type User, 
  type InsertUser 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Building methods
  getAllBuildings(): Promise<Building[]>;
  getBuilding(id: string): Promise<Building | undefined>;
  createBuilding(building: InsertBuilding): Promise<Building>;
  updateBuilding(id: string, building: Partial<InsertBuilding>): Promise<Building | undefined>;

  // Electrical data methods
  getLatestElectricalData(buildingId: string): Promise<ElectricalData | undefined>;
  getElectricalDataHistory(buildingId: string, hours: number): Promise<ElectricalData[]>;
  createElectricalData(data: InsertElectricalData): Promise<ElectricalData>;

  // Environmental data methods
  getLatestEnvironmentalData(buildingId: string): Promise<EnvironmentalData | undefined>;
  getEnvironmentalDataHistory(buildingId: string, hours: number): Promise<EnvironmentalData[]>;
  createEnvironmentalData(data: InsertEnvironmentalData): Promise<EnvironmentalData>;

  // Alert methods
  getActiveAlerts(buildingId?: string): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  resolveAlert(id: string): Promise<Alert | undefined>;

  // Component methods
  getElectricalComponents(buildingId?: string): Promise<ElectricalComponent[]>;
  createElectricalComponent(component: InsertElectricalComponent): Promise<ElectricalComponent>;
  updateElectricalComponent(id: string, component: Partial<InsertElectricalComponent>): Promise<ElectricalComponent | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllBuildings(): Promise<Building[]> {
    // Ya no trabajamos con edificios, solo con componentes individuales
    return [];
  }

  async getBuilding(id: string): Promise<Building | undefined> {
    const [building] = await db.select().from(buildings).where(eq(buildings.id, id));
    return building || undefined;
  }

  async createBuilding(building: InsertBuilding): Promise<Building> {
    const [newBuilding] = await db.insert(buildings).values(building).returning();
    return newBuilding;
  }

  async updateBuilding(id: string, building: Partial<InsertBuilding>): Promise<Building | undefined> {
    const [updatedBuilding] = await db
      .update(buildings)
      .set(building)
      .where(eq(buildings.id, id))
      .returning();
    return updatedBuilding || undefined;
  }

  async getLatestElectricalData(buildingId: string): Promise<ElectricalData | undefined> {
    const [data] = await db
      .select()
      .from(electricalData)
      .where(eq(electricalData.buildingId, buildingId))
      .orderBy(desc(electricalData.timestamp))
      .limit(1);
    return data || undefined;
  }

  async getElectricalDataHistory(buildingId: string, hours: number): Promise<ElectricalData[]> {
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - hours);
    
    return await db
      .select()
      .from(electricalData)
      .where(
        and(
          eq(electricalData.buildingId, buildingId),
          gte(electricalData.timestamp, hoursAgo)
        )
      )
      .orderBy(desc(electricalData.timestamp));
  }

  async createElectricalData(data: InsertElectricalData): Promise<ElectricalData> {
    const [newData] = await db.insert(electricalData).values(data).returning();
    return newData;
  }

  async getLatestEnvironmentalData(buildingId: string): Promise<EnvironmentalData | undefined> {
    const [data] = await db
      .select()
      .from(environmentalData)
      .where(eq(environmentalData.buildingId, buildingId))
      .orderBy(desc(environmentalData.timestamp))
      .limit(1);
    return data || undefined;
  }

  async getEnvironmentalDataHistory(buildingId: string, hours: number): Promise<EnvironmentalData[]> {
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - hours);
    
    return await db
      .select()
      .from(environmentalData)
      .where(
        and(
          eq(environmentalData.buildingId, buildingId),
          gte(environmentalData.timestamp, hoursAgo)
        )
      )
      .orderBy(desc(environmentalData.timestamp));
  }

  async createEnvironmentalData(data: InsertEnvironmentalData): Promise<EnvironmentalData> {
    const [newData] = await db.insert(environmentalData).values(data).returning();
    return newData;
  }

  async getActiveAlerts(buildingId?: string): Promise<Alert[]> {
    const conditions = [eq(alerts.isActive, true)];
    if (buildingId) {
      conditions.push(eq(alerts.buildingId, buildingId));
    }

    return await db
      .select()
      .from(alerts)
      .where(and(...conditions))
      .orderBy(desc(alerts.createdAt));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async resolveAlert(id: string): Promise<Alert | undefined> {
    const [resolvedAlert] = await db
      .update(alerts)
      .set({ isActive: false, resolvedAt: new Date() })
      .where(eq(alerts.id, id))
      .returning();
    return resolvedAlert || undefined;
  }

  async getElectricalComponents(buildingId?: string): Promise<ElectricalComponent[]> {
    if (buildingId) {
      return await db
        .select()
        .from(electricalComponents)
        .where(eq(electricalComponents.buildingId, buildingId));
    }
    return await db.select().from(electricalComponents);
  }

  async createElectricalComponent(component: InsertElectricalComponent): Promise<ElectricalComponent> {
    const [newComponent] = await db.insert(electricalComponents).values(component).returning();
    return newComponent;
  }

  async updateElectricalComponent(id: string, component: Partial<InsertElectricalComponent>): Promise<ElectricalComponent | undefined> {
    const [updatedComponent] = await db
      .update(electricalComponents)
      .set(component)
      .where(eq(electricalComponents.id, id))
      .returning();
    return updatedComponent || undefined;
  }
}

export const storage = new DatabaseStorage();
