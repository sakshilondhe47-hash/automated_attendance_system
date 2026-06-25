# Attendance Project Setup Guide

This guide helps you set up the Attendance project on a new Windows laptop from scratch.

## 1. Required software

Install the following software on the new laptop:

- Git
- Java 21 JDK
- Node.js 20 LTS
- npm (comes with Node.js)
- VS Code (recommended)
- Windows PowerShell

## 2. Recommended VS Code extensions

Open VS Code and install these extensions:

- Extension Pack for Java
- Spring Boot Extension Pack
- Angular Language Service
- TypeScript Hero
- Prettier - Code formatter
- ESLint

## 3. Install Git

Download and install Git from:

https://git-scm.com/download/win

After installation, verify:

```powershell
git --version
```

## 4. Install Java 21

Download and install JDK 21 from:

https://adoptium.net/temurin/releases/

Choose:
- Version: 21
- OS: Windows
- Architecture: x64

Verify installation:

```powershell
java -version
```

Set JAVA_HOME in PowerShell for the current session:

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.11"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
```

You can also set it permanently in Windows Environment Variables.

## 5. Install Node.js 20 LTS

Download Node.js from:

https://nodejs.org/

Install the LTS version.

Verify:

```powershell
node -v
npm -v
```

## 6. Clone or copy the project

If you have Git access:

```powershell
cd C:\
git clone <your-repo-url> atten
```

If you received the project as a ZIP file:
- Extract it to a folder such as:

```powershell
C:\atten
```

## 7. Open the project in VS Code

Open VS Code and choose the folder:

```powershell
C:\atten
```

## 8. Backend setup

Open PowerShell and run:

```powershell
cd C:\atten\backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.11"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

\mvnw.cmd spring-boot:run
```

### Backend notes

- Backend runs on port 8081
- Default admin login is:
  - Username: admin
  - Password: admin123

## 9. Frontend setup

Open a second PowerShell window and run:

```powershell
cd C:\atten\frontend
npm install
npm start
```

The frontend will run on:

```text
http://localhost:4200
```

## 10. Useful commands

### Backend

```powershell
cd C:\atten\backend
.
\mvnw.cmd spring-boot:run
```

### Frontend

```powershell
cd C:\atten\frontend
npm install
npm start
npm run build
```

## 11. Common issues and fixes

### Java issue
If backend does not start:
- Check Java 21 installation
- Confirm JAVA_HOME is correct
- Verify Java version with:

```powershell
java -version
```

### Port already in use
If port 8081 is busy, stop the previous process or change the backend port.

### Node/npm issue
If npm fails:

```powershell
npm cache verify
```

Then run:

```powershell
npm install
```

## 12. Project structure

- backend: Spring Boot Java backend
- frontend: Angular frontend

## 13. Summary

To run the project on a new laptop:

1. Install Git, Java 21, Node.js, and VS Code
2. Open the project folder
3. Run backend with Maven wrapper
4. Run frontend with npm
5. Open http://localhost:4200

If you want, I can also create a second file named README_SETUP.txt with the same content for easier copying to a new machine.
