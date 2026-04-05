# 🌌 ZORVYN Backend: Financial Intelligence Core

[![NestJS](https://img.shields.io/badge/Framework-NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

ZORVYN is a high-performance financial API core designed for secure transaction management and real-time analytical processing. Built with **NestJS** and **Prisma**, it provides a robust foundation for modern fintech ecosystems.

---

## 🚀 Live Environment

| Service | Access Link |
| :--- | :--- |
| **🌐 Live Demo** | [zorvyn-fintech-demo-production.up.railway.app](https://zorvyn-fintech-demo-production.up.railway.app) |
| **📚 API Docs (Swagger)** | [zorvyn-fintech-production.up.railway.app/api/docs](https://zorvyn-fintech-production.up.railway.app/api/docs) |
| **📡 Backend URL** | `https://zorvyn-fintech-production.up.railway.app` |

---

## 🏗️ System Architecture

The project follows a modular NestJS architecture, ensuring high maintainability and clear separation of concerns.

```text
src/
├── common/              # Cross-cutting concerns (Guards, Decorators, Filters)
├── database/            # Prisma integration and driver adapters
└── modules/
    ├── auth/            # Identity & Access Management (JWT)
    ├── users/           # User governance and Role-Based Access Control
    ├── transactions/    # Financial ledger and aggregation logic
    └── health/          # System telemetry and DB connectivity checks
```

### Flow Architecture
The following diagram illustrates the request lifecycle and component interaction within the ZORVYN ecosystem:

```mermaid
graph TD
    Client[User / Frontend] --- HTTP((HTTP/HTTPS))
    HTTP --> Guard{Auth Guard}
    
    Guard -- Reject --> Error[401/403 Error]
    Guard -- Accept --> Controller[Controller]
    
    subgraph "ZORVYN Core"
    Controller --> Validation[DTO Validation]
    Validation --> Service[Business Service]
    Service --> Persistence[(Prisma / DB)]
    end
    
    Persistence --> Service
    Service --> Controller
    Controller --> Response[JSON Response]
    Response --> Client

    %% Professional Color Palette
    classDef default fill:#f8fafc,stroke:#1e293b,stroke-width:1px,color:#1e293b;
    classDef security fill:#6366f1,stroke:#4338ca,stroke-width:2px,color:#fff;
    classDef logic fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef storage fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef network fill:#94a3b8,stroke:#475569,stroke-width:1px,color:#fff;

    class Guard security;
    class Service logic;
    class Persistence storage;
    class HTTP,Error,Response network;
```

---

## 🔒 Core API Flows

### 1. Identity & Authentication (`/auth`)
Managed by a JWT-based security layer. On registration, users are assigned a default `VIEWER` role, which can be elevated to `ANALYST` or `ADMIN` via the User Management panel.

### 2. Transaction Ledger (`/transactions`)
The backbone of the platform. Supports full CRUD operations with high-precision decimal storage. Includes specialized analytical endpoints:
- `GET /transactions/monthly-breakdown`: Computes income vs. expense trends.
- `GET /transactions/global-analytics`: Provides platform-wide sums for elevated roles.

### 3. Role-Based Access Control (RBAC)
Architecture enforces strict permission boundaries:
- **VIEWER**: Read-only summary access.
- **ANALYST**: Access to detailed analytics and trend intelligence.
- **ADMIN**: Full clearance including user role modification and record generation.

---

## 🛠️ Technical Configuration

### Environment Variables
Configure these in your `.env` or Railway settings:

```bash
DATABASE_URL=           # PostgreSQL connection string
DIRECT_DATABASE_URL=    # PostgreSQL connection (for Prisma v7 pg-adapter)
JWT_SECRET=             # High-entropy string for token signing
FRONTEND_URL=           # The URL of your deployed frontend (for CORS)
```

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

3. **Launch Server**
   ```bash
   npm run start:dev
   ```

---

## 🛡️ Telemetry & Monitoring

Deployments include a `/health` endpoint designed for Railway's monitoring. It performs real-time verification of the database pool status and schema availability.

> [!TIP]
> Visit `/health` any time to confirm that the backend-to-database link is operational.

---