# Attendance backend

## Requirements

- Java 21
- MySQL

Maven does not need to be installed globally; use `mvnw.cmd` on Windows or `./mvnw` on macOS/Linux.

## Configuration

Set these environment variables before starting the application:

- `DB_USERNAME` and `DB_PASSWORD`: credentials for a dedicated MySQL user with access to `attendance_app_db`.
- `JWT_SECRET`: at least 32 random characters. If omitted, a random development-only secret is generated at startup.
- `ADMIN_PASSWORD`: initial administrator password. If omitted, automatic administrator creation is disabled.

Optional variables are documented in `.env.example`.

PowerShell example:

```powershell
$env:DB_USERNAME = "attendance_app"
$env:DB_PASSWORD = "your-database-password"
$env:JWT_SECRET = "replace-with-at-least-32-random-characters"
$env:ADMIN_PASSWORD = "your-admin-password"
.\mvnw.cmd spring-boot:run
```

## Verify

```powershell
.\mvnw.cmd test
.\mvnw.cmd package
```
