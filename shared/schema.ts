import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const buildings = pgTable("buildings", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'engineering', 'administrative', 'laboratory'
  description: text("description"),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  isOnline: boolean("is_online").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const electricalData = pgTable("electrical_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buildingId: varchar("building_id").notNull().references(() => buildings.id),
  voltage: real("voltage").notNull(),
  current: real("current").notNull(),
  power: real("power").notNull(),
  powerFactor: real("power_factor").notNull(),
  frequency: real("frequency").notNull().default(60),
  thd: real("thd").notNull().default(0), // Total Harmonic Distortion
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const environmentalData = pgTable("environmental_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buildingId: varchar("building_id").notNull().references(() => buildings.id),
  temperature: real("temperature").notNull(),
  humidity: real("humidity").notNull(),
  illumination: real("illumination").notNull().default(300),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buildingId: varchar("building_id").notNull().references(() => buildings.id),
  type: text("type").notNull(), // 'voltage_low', 'current_high', 'temperature_high', etc.
  severity: text("severity").notNull(), // 'info', 'warning', 'critical'
  message: text("message").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const electricalComponents = pgTable("electrical_components", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'load', 'transformer', 'inverter', 'solar_panel', 'battery', 'biodigester', 'busbar'
  symbol: text("symbol").notNull(), // Emoji or symbol reference
  name: text("name").notNull(),
  label: text("label"), // Custom user label
  uniqueIdentifier: text("unique_identifier"), // Identificador único editable por el usuario
  description: text("description"),
  category: text("category").notNull(), // 'load', 'power_equipment', 'renewable', 'storage', 'distribution'
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  buildingId: varchar("building_id").references(() => buildings.id),
  // Configuración de consultas SQL
  sqlQuery: text("sql_query"), // Consulta SQL personalizada para este componente
  dataSourceType: text("data_source_type").default('fiware'), // 'fiware', 'custom_sql', 'simulated'
  refreshInterval: integer("refresh_interval").default(10), // Intervalo de actualización en segundos
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const componentData = pgTable("component_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  componentId: varchar("component_id").notNull().references(() => electricalComponents.id),
  dataKey: text("data_key").notNull(), // 'voltage', 'current', 'power', 'temperature', etc.
  dataValue: real("data_value").notNull(),
  dataUnit: text("data_unit"), // 'V', 'A', 'W', 'C', etc.
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Relations
export const buildingsRelations = relations(buildings, ({ many }) => ({
  electricalData: many(electricalData),
  environmentalData: many(environmentalData),
  alerts: many(alerts),
  components: many(electricalComponents),
}));

export const electricalDataRelations = relations(electricalData, ({ one }) => ({
  building: one(buildings, {
    fields: [electricalData.buildingId],
    references: [buildings.id],
  }),
}));

export const environmentalDataRelations = relations(environmentalData, ({ one }) => ({
  building: one(buildings, {
    fields: [environmentalData.buildingId],
    references: [buildings.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  building: one(buildings, {
    fields: [alerts.buildingId],
    references: [buildings.id],
  }),
}));

export const electricalComponentsRelations = relations(electricalComponents, ({ one, many }) => ({
  building: one(buildings, {
    fields: [electricalComponents.buildingId],
    references: [buildings.id],
  }),
  componentData: many(componentData),
}));

export const componentDataRelations = relations(componentData, ({ one }) => ({
  component: one(electricalComponents, {
    fields: [componentData.componentId],
    references: [electricalComponents.id],
  }),
}));

// Nuevas tablas para el sistema de dashboards dinámicos
export const dashboards = pgTable("dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  layout: text("layout").notNull().default('grid'), // 'grid', 'flex'
  columns: integer("columns").notNull().default(4),
  componentId: varchar("component_id").references(() => electricalComponents.id),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dashboardId: varchar("dashboard_id").notNull().references(() => dashboards.id, { onDelete: 'cascade' }),
  type: text("type").notNull(), // 'chart', 'metric', 'gauge', 'table'
  title: text("title").notNull(),
  dataSource: text("data_source").notNull(), // 'crate', 'postgres', 'api'
  sqlQuery: text("sql_query"), // Consulta SQL para obtener datos
  chartType: text("chart_type"), // 'line', 'bar', 'pie', 'area', 'gauge'
  dataColumns: text("data_columns"), // JSON con configuración de columnas
  position: integer("position").notNull().default(0),
  width: integer("width").notNull().default(1), // Grid width
  height: integer("height").notNull().default(1), // Grid height
  refreshInterval: integer("refresh_interval").notNull().default(30), // seconds
  isVisible: boolean("is_visible").notNull().default(true),
  config: text("config"), // JSON con configuración adicional del widget
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relaciones para dashboards
export const dashboardsRelations = relations(dashboards, ({ one, many }) => ({
  component: one(electricalComponents, {
    fields: [dashboards.componentId],
    references: [electricalComponents.id],
  }),
  widgets: many(dashboardWidgets),
}));

export const dashboardWidgetsRelations = relations(dashboardWidgets, ({ one }) => ({
  dashboard: one(dashboards, {
    fields: [dashboardWidgets.dashboardId],
    references: [dashboards.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBuildingSchema = createInsertSchema(buildings).omit({
  createdAt: true,
});

export const insertElectricalDataSchema = createInsertSchema(electricalData).omit({
  id: true,
  timestamp: true,
});

export const insertEnvironmentalDataSchema = createInsertSchema(environmentalData).omit({
  id: true,
  timestamp: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertElectricalComponentSchema = createInsertSchema(electricalComponents).omit({
  id: true,
  createdAt: true,
});

export const insertComponentDataSchema = createInsertSchema(componentData).omit({
  id: true,
  timestamp: true,
});

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBuilding = z.infer<typeof insertBuildingSchema>;
export type Building = typeof buildings.$inferSelect;

export type InsertElectricalData = z.infer<typeof insertElectricalDataSchema>;
export type ElectricalData = typeof electricalData.$inferSelect;

export type InsertEnvironmentalData = z.infer<typeof insertEnvironmentalDataSchema>;
export type EnvironmentalData = typeof environmentalData.$inferSelect;

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

export type InsertElectricalComponent = z.infer<typeof insertElectricalComponentSchema>;
export type ElectricalComponent = typeof electricalComponents.$inferSelect;

export type InsertComponentData = z.infer<typeof insertComponentDataSchema>;
export type ComponentData = typeof componentData.$inferSelect;

export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type Dashboard = typeof dashboards.$inferSelect;

export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
