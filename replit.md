# Universidad Pontificia Bolivariana - Sistema de Diagrama Unifilar Eléctrico

## Overview

This is a comprehensive electrical single-line diagram monitoring system designed for university facilities. The application provides real-time monitoring of electrical and environmental parameters across multiple buildings, featuring an interactive diagram interface that visualizes electrical components, data flows, and system status.

The system is built as a full-stack web application with a React frontend and Express.js backend, designed to monitor and display electrical data for university buildings in compliance with NTC2050 electrical standards. It provides real-time data visualization, interactive electrical diagrams, and comprehensive monitoring dashboards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **UI Library**: Radix UI components with shadcn/ui design system for consistent, accessible interface components
- **Canvas Rendering**: Konva.js (react-konva) for interactive 2D electrical diagram rendering and manipulation
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API services
- **Database ORM**: Drizzle ORM for type-safe database operations and migrations
- **Real-time Communication**: WebSocket implementation for live data updates and system monitoring
- **Session Management**: Express sessions with PostgreSQL session store for user authentication
- **Development**: Hot module replacement and development server integration with Vite

### Data Storage Solutions
- **Primary Database**: PostgreSQL as the main relational database
- **Database Client**: Neon serverless PostgreSQL for cloud deployment and scalability
- **Schema Management**: Drizzle migrations for version-controlled database schema evolution
- **Data Models**: Structured tables for buildings, electrical data, environmental data, alerts, and electrical components

### Database Schema Design
The system uses a normalized relational schema with the following core entities:
- **Buildings**: University facility information with positioning and status
- **Electrical Data**: Real-time electrical measurements (voltage, current, power, power factor, frequency, THD)
- **Environmental Data**: Ambient conditions (temperature, humidity, illumination)
- **Alerts**: System alerts with severity levels and status tracking
- **Electrical Components**: Component library for diagram building
- **Users**: Authentication and authorization

### Authentication and Authorization
- **Session-based Authentication**: Traditional session management with secure cookie handling
- **User Management**: Basic user registration and login functionality
- **Authorization**: Role-based access control for system operations

### Real-time Data Flow
- **WebSocket Connections**: Bidirectional communication for live electrical data updates
- **Data Polling**: Fallback polling mechanism for data synchronization
- **Caching Strategy**: Client-side caching with TanStack Query for optimal performance
- **Connection Management**: Automatic reconnection handling for reliable real-time updates

### Component Architecture
- **Electrical Diagram Canvas**: Interactive drag-and-drop canvas for building custom electrical single-line diagrams
- **90-Degree Connection System**: Smart routing system that creates straight lines with 90-degree angles between components for professional electrical diagrams
- **Draggable Component System**: User-customizable electrical symbols with editable labels and positioning
- **Double-Click Load Dashboard**: Interactive load components that open comprehensive electrical monitoring dashboards on double-click
- **Real-time Charts**: Live electrical parameter visualization with historical data trending (voltage, current, power, power factor, frequency, THD)
- **Resizable Busbar System**: Professional electrical busbars with horizontal resizing capability and proper electrical connection points
- **Building Monitoring Blocks**: Modular components representing individual university buildings with live data
- **Dashboard System**: Comprehensive monitoring interfaces with real-time data visualization and charts
- **Component Library**: NTC2050-compliant electrical symbols (Carga, Transformador, Inversor, Panel Solar, Batería, Biodigestor, Barras)
- **System Status Panel**: Centralized monitoring of overall system health and alerts
- **Custom Symbol Editor**: Ability to add custom labels to electrical components and drag them to build diagrams

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling and automatic scaling
- **Drizzle ORM**: TypeScript ORM with PostgreSQL dialect for database operations

### UI and Visualization
- **Radix UI**: Headless UI components for accessible interface elements
- **Konva.js**: 2D canvas library for interactive electrical diagram rendering
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography

### Development and Build Tools
- **Vite**: Frontend build tool with hot module replacement and optimized bundling
- **TypeScript**: Static type checking for enhanced development experience
- **ESBuild**: Fast JavaScript bundler for production builds

### Real-time Communication
- **WebSocket (ws)**: Native WebSocket implementation for real-time data streaming
- **TanStack Query**: Server state management with intelligent caching and synchronization

### Form and Data Handling
- **React Hook Form**: Performant form handling with validation
- **Zod**: Schema validation for type-safe data parsing and validation
- **Date-fns**: Date manipulation and formatting utilities

The system follows a modern full-stack architecture with clear separation of concerns, emphasizing real-time data capabilities, interactive visualization, and maintainable code structure suitable for electrical monitoring applications in educational environments.