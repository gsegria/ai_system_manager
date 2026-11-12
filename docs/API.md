# API Reference

## 1. Overview

AI System Manager provides REST-style HTTP APIs through Flask.

Base URL:

```text
http://<ROCK5B_IP>:5000
```

Authentication:

- Protected APIs require login.
- Session-based authentication using Flask cookies.
- POST requests require CSRF validation.

## 2. Authentication APIs

### Login

| Item | Value |
|---|---|
| Method | GET / POST |
| Endpoint | `/login` |
| Authentication | Not required |

Login form fields:

- username
- password
- csrf_token

Successful login redirects to `/dashboard`.

### Logout

| Item | Value |
|---|---|
| Method | POST |
| Endpoint | `/logout` |
| Authentication | Required |
| CSRF | Required |

Successful logout redirects to `/login`.

## 3. Service APIs

All service APIs require authentication.

### Get Service Status

| Item | Value |
|---|---|
| Method | GET |
| Endpoint | `/api/status` |

Returns application service status.

### Start Service

| Item | Value |
|---|---|
| Method | POST |
| Endpoint | `/api/service/start` |
| Authentication | Required |
| CSRF | Required |

Starts the application service and registered sensors.

### Stop Service

| Item | Value |
|---|---|
| Method | POST |
| Endpoint | `/api/service/stop` |
| Authentication | Required |
| CSRF | Required |

Stops the application service and registered sensors.

POST request header:

```http
X-CSRF-Token: <csrf_token>
```

## 4. Sensor APIs

All sensor APIs require authentication.

### Get Sensor Status

| Item | Value |
|---|---|
| Method | GET |
| Endpoint | `/api/sensors` |

Returns the status of registered sensors.

### Get Latest Sensor Data

| Item | Value |
|---|---|
| Method | GET |
| Endpoint | `/api/data` |

Returns the latest collected sensor data.

Supported sensor types:

- Radar
- Temperature
- GPS
- IMU
- Battery
- Camera
- Depth Camera

Current implementations use Simulation mode.

## 5. Data Collector API

### Get Collector Status

| Item | Value |
|---|---|
| Method | GET |
| Endpoint | `/api/collector` |
| Authentication | Required |

Returns collector runtime information:

- Running status
- Collection interval
- Collection count
- Sensor error statistics
- History count
- Last collection error
- Logging error status

## 6. System Monitoring API

### Get System Information

| Item | Value |
|---|---|
| Method | GET |
| Endpoint | `/api/system` |
| Authentication | Required |

Returns available system resource information:

- CPU usage and frequency
- CPU temperature
- Memory usage
- Storage usage
- System uptime
- GPU / NPU hardware information, where available

Hardware monitoring values do not represent actual AI inference performance.

## 7. HTTP Status Codes

| Status Code | Description |
|---|---|
| 200 | Request successful |
| 400 | Invalid request |
| 401 | Authentication required |
| 403 | Access denied or invalid CSRF token |
| 500 | Internal service error |

## 8. Security

- Passwords are stored using scrypt hashing.
- Protected APIs require an authenticated session.
- POST requests require CSRF validation.
- Session timeout is configurable.
- Login failures are subject to temporary lockout.

## 9. Current API Scope

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Root / login entry |
| GET / POST | `/login` | User login |
| POST | `/logout` | User logout |
| GET | `/dashboard` | Dashboard |
| GET | `/api/status` | Application status |
| GET | `/api/sensors` | Sensor status |
| GET | `/api/data` | Latest sensor data |
| GET | `/api/collector` | Collector status |
| GET | `/api/system` | System monitoring |
| POST | `/api/service/start` | Start services |
| POST | `/api/service/stop` | Stop services |

### Not Yet Implemented

- Log query API
- Log download API
- Sensor configuration API
- Historical data query API

## 10. API Versioning

Current API version: Initial development.

The API is not yet versioned in its URL.

Future versions may use:

```text
/api/v1/...
```

API changes should maintain backward compatibility whenever possible.