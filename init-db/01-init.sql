-- Script de inicialización de la base de datos para el Sistema Unifilar
-- Este script se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Mensaje de confirmación
SELECT 'Base de datos inicializada correctamente para el Sistema Unifilar' as message;
