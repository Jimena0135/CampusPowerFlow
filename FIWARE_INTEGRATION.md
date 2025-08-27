# Integración FIWARE - Sistema Unifilar

## 📋 Descripción

Esta documentación explica cómo el Sistema de Diagrama Unifilar se conecta con la infraestructura FIWARE existente para obtener datos en tiempo real de sensores y dispositivos IoT.

## 🏗️ Arquitectura de Integración

### Componentes FIWARE Utilizados

1. **Orion Context Broker** (`orion-plataforma:1026`)
   - Almacena las entidades y sus atributos actuales
   - Proporciona API REST para consultar estado actual de dispositivos

2. **CrateDB** (`crate-db:4200`, `crate-db:5432`)
   - Almacena series de tiempo históricas
   - Contiene datos históricos de todos los sensores

3. **QuantumLeap** (`quantumleap:8668`)
   - Conecta Orion con CrateDB
   - Persiste automáticamente cambios de entidades como series de tiempo

### Flujo de Datos

```
Sensores IoT → Agentes → Orion Context Broker → QuantumLeap → CrateDB
                                     ↓
                            Sistema Unifilar (consulta datos)
```

## 🔗 Mapeo de Entidades

### Edificios Universitarios

| Building ID | Nombre | Entidades FIWARE Asociadas |
|-------------|--------|----------------------------|
| `BLOQUE_A` | Bloque A - Ingeniería | `SmartMeter_BLOQUE_A`, `WeatherStation_A` |
| `BLOQUE_B` | Bloque B - Administrativo | `SmartMeter_BLOQUE_B`, `WeatherStation_B` |
| `BLOQUE_C` | Bloque C - Laboratorios | `SmartMeter_BLOQUE_C`, `WeatherStation_C` |

### Tipos de Datos Integrados

#### Datos Eléctricos (Smart Meters)
- **Voltaje** (voltage)
- **Corriente** (current) 
- **Potencia** (power)
- **Factor de Potencia** (power_factor)
- **Frecuencia** (frequency)
- **THD** (Total Harmonic Distortion)

#### Datos Ambientales (Weather Stations)
- **Temperatura** (temperature)
- **Humedad** (humidity)
- **Iluminación** (illumination)

## 🚀 Configuración

### Variables de Entorno

```env
# Conexión a FIWARE Orion
ORION_URL=http://orion-plataforma:1026
FIWARE_SERVICE=sec
FIWARE_SERVICEPATH=/

# Conexión a CrateDB
CRATE_HOST=crate-db
CRATE_PORT=5432
CRATE_URL=http://crate-db:4200

# Base de datos local (PostgreSQL)
DATABASE_URL=postgresql://unifilar_user:unifilar_password@unifilar-postgres:5432/unifilar_db
```

### Docker Compose

El servicio `unifilar-app` debe depender de:
- `orion` (Orion Context Broker)
- `crate` (CrateDB)
- `unifilar-postgres` (Base de datos local)

## 📡 APIs Disponibles

### Endpoints FIWARE

#### Obtener Datos Eléctricos en Tiempo Real
```http
GET /api/fiware/buildings/{buildingId}/electrical-data
```

#### Obtener Datos Ambientales en Tiempo Real
```http
GET /api/fiware/buildings/{buildingId}/environmental-data
```

#### Listar Entidades FIWARE
```http
GET /api/fiware/entities?type=SmartMeter
```

#### Obtener Series de Tiempo de CrateDB
```http
GET /api/fiware/timeseries/{entityId}/{attribute}?hours=24
```

### Ejemplos de Uso

#### Consultar Voltage del Bloque A (últimas 24 horas)
```bash
curl "http://localhost:5000/api/fiware/timeseries/SmartMeter_BLOQUE_A/voltage?hours=24"
```

#### Obtener Estado Actual del Bloque B
```bash
curl "http://localhost:5000/api/fiware/buildings/BLOQUE_B/electrical-data"
```

## 🔄 Sistema Híbrido

### Estrategia de Datos

1. **Prioridad FIWARE**: Si hay datos disponibles de FIWARE, se usan estos
2. **Fallback Local**: Si FIWARE no está disponible, se usan datos simulados
3. **Cache Local**: Datos de FIWARE se cachean localmente para performance
4. **Sincronización**: Datos se actualizan cada 10 segundos

### Tolerancia a Fallos

- **Reconexión Automática**: El sistema intenta reconectarse a FIWARE automáticamente
- **Degradación Elegante**: Si FIWARE falla, continúa con datos simulados
- **Indicadores de Estado**: UI muestra estado de conexión FIWARE en tiempo real

## 🛠️ Desarrollo

### Archivos Principales

- `server/fiware-connector.ts`: Conector principal a servicios FIWARE
- `server/init-buildings.ts`: Inicialización de edificios por defecto
- `client/src/hooks/use-fiware-data.tsx`: Hook React para datos FIWARE
- `client/src/components/fiware-status.tsx`: Componente de estado FIWARE

### Comandos Útiles

#### Verificar Estado de Servicios FIWARE
```bash
# Orion Context Broker
curl http://localhost:1026/version

# CrateDB
curl http://localhost:4200

# QuantumLeap  
curl http://localhost:8668/version
```

#### Consultar Entidades Directamente
```bash
# Listar todas las entidades
curl -H "fiware-service: sec" http://localhost:1026/v2/entities

# Obtener entidad específica
curl -H "fiware-service: sec" http://localhost:1026/v2/entities/SmartMeter_BLOQUE_A
```

## 📊 Monitoreo

### Componente de Estado FIWARE

La aplicación incluye un componente `FiwareStatus` que muestra:
- Estado de conexión a Orion Context Broker
- Estado de conexión a CrateDB
- Estado general del sistema FIWARE
- Última verificación de estado

### Logs del Sistema

```bash
# Ver logs del contenedor Unifilar
docker logs unifilar_app

# Ver logs en tiempo real
docker logs -f unifilar_app
```

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión a Orion
```
Error: Failed to fetch entities from Orion
```
**Solución**: Verificar que el contenedor `orion` esté ejecutándose y accesible.

#### 2. Error de Conexión a CrateDB
```
Error: Error connecting to CrateDB
```
**Solución**: Verificar que el contenedor `crate` esté healthy y el puerto 5432 esté disponible.

#### 3. Datos No Actualizándose
**Posibles Causas**:
- Agentes de escritura no están funcionando
- QuantumLeap no está persistiendo datos
- Nombres de entidades no coinciden con el mapeo

### Verificación de Integridad

#### Verificar Flujo Completo
1. Sensores → Agentes ✓
2. Agentes → Orion ✓
3. Orion → QuantumLeap ✓
4. QuantumLeap → CrateDB ✓
5. CrateDB → Sistema Unifilar ✓

## 📝 Próximas Mejoras

- [ ] Suscripciones WebSocket a cambios en Orion
- [ ] Cache más inteligente con TTL
- [ ] Métricas de performance de integración
- [ ] Dashboard específico para datos históricos de FIWARE
- [ ] Alertas basadas en umbrales de FIWARE
