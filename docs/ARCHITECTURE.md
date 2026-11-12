# System Architecture

## 1. Overview

AI System Manager is a modular framework for managing application services, sensors, sensor data, and system resources.

The architecture separates application management, sensor management, data processing, security, system monitoring, and Web management.

- Initial Platform: ROCK 5B+ (RK3588)
- Development Mode: Simulation
- Language: Python 3.11

## 2. Main Modules

| Module | Responsibility |
|---|---|
| application | Service lifecycle and application status |
| config | Application and sensor configuration |
| sensors | Sensor interfaces, registration, and implementations |
| engine | Data collection, formatting, and logging |
| security | Authentication and access control |
| system_monitor | System resource monitoring |
| web_manager | Flask API and Web frontend |

## 3. Sensor Architecture

All sensors implement the common interface defined in `sensors/base.py`.

Common methods:

- `start()`
- `stop()`
- `read()`
- `get_status()`

Core components:

| Component | Responsibility |
|---|---|
| BaseSensor | Common sensor interface |
| SensorRegistry | Sensor registration and lookup |
| SensorFactory | Sensor instance creation |
| SensorManager | Sensor lifecycle and data access |
| SensorSettings | Configuration loading and validation |

Sensor registration is configuration-driven through `config/sensors.ini`.

The architecture supports independent simulation and hardware implementations.

Currently supported sensor types:

- Radar
- Temperature
- GPS
- IMU
- Battery
- Camera
- Depth Camera

All seven sensor types have passed factory and manager integration tests. Current implementations are simulation-based.

## 4. Application and Data Engine

`ServiceManager` coordinates sensor management and data collection.

Core data components:

| Component | Responsibility |
|---|---|
| SensorDataCollector | Periodic sensor data collection |
| SensorDataFormatter | Unified data formatting |
| SensorDataLogger | JSONL data logging |

Data processing flow:

1. SensorManager reads sensor data.
2. SensorDataCollector collects readings periodically.
3. SensorDataFormatter normalizes the data.
4. SensorDataLogger stores records in JSONL format.
5. Latest data and history are made available to the Web API.

## 5. Security

The security module provides:

- User authentication
- Password hashing and validation
- Login failure protection
- Session management and timeout
- CSRF protection for POST requests

## 6. System Monitoring

The `system_monitor` module provides platform resource monitoring:

- CPU usage, frequency, and temperature
- Memory and storage usage
- System uptime
- GPU and NPU hardware information, where available

Hardware monitoring does not represent actual AI inference utilization.

## 7. Web Management

The Web interface uses Flask and provides:

- Login and session management
- Service START / STOP controls
- Sensor status and data display
- Data collector status
- System resource monitoring
- Automatic Dashboard refresh

The Dashboard supports seven sensor cards and has been verified through a Windows browser in Simulation mode.

## 8. Runtime Data Flow

```text
             Web Browser
                  |
                  v
          Flask Web Manager
                  |
          +-------+-------+
          |               |
          v               v
    ServiceManager   SystemMonitor
          |
          v
     SensorManager
          |
          v
    SensorRegistry
          |
          v
     SensorFactory
          |
          v
     Sensor Instances
          |
          v
  SensorDataCollector
          |
          v
  SensorDataFormatter
          |
       +--+--+
       |     |
       v     v
   Latest  SensorDataLogger
    Data       |
       |       v
       |    JSONL Files
       v
    Web API
       |
       v
   Dashboard
```

## 9. Platform Strategy

The modular architecture is designed to support:

- ROCK 5B+ (RK3588)
- NVIDIA Jetson
- Windows development and integration

Future extensions include physical sensor drivers, AI inference integration, and advanced log management.

## 10. Related Documents

| Document | Description |
|---|---|
| `README.md` | Project overview and startup guide |
| `docs/SENSOR_CATALOG.md` | Sensor types and specifications |
| `docs/API.md` | Web API specifications |
| `docs/DATA_FLOW.md` | Data collection and processing details |
| `docs/DEVELOPMENT_PROGRESS.md` | Development status and next steps |