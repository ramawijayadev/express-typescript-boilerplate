# Core Feature Handbook

> Implementation Handbook & Checklist

> This document defines the **Core Features** provided by the backend starter kit. It outlines the fundamental features available out-of-the-box and the roadmap for additional modules.

## Index
- [1. Purpose & Scope](#1-purpose--scope)
- [2. Tiering Overview](#2-tiering-overview)
- [3. Tier 1 – Mandatory](#3-tier-1--mandatory)
- [4. Tier 2 – Highly Recommended](#4-tier-2--highly-recommended)
- [5. Tier 3 – Optional / Advanced](#5-tier-3--optional--advanced)
- [6. General Conventions](#6-general-conventions)
- [7. Implementation Checklist](#7-implementation-checklist)

## 1. Purpose & Scope
This document serves as the application functionality "blueprint".
- **Standardization:** Defines generic features that are always present.
- **Reusability:** Guidelines for creating modules that can be reused in other projects.
- **Transparency:** Clearly states what is currently implemented vs. what is planned.

## 2. Tiering Overview

**[Tier 1: Must Have]**
Core foundation. The boilerplate comes with these features ready to use.
- Auth, User Management, Generic CRUD, Notification System (Email).

**[Tier 2: Infrastructure]**
Essential infrastructure layers that are abstracted and ready for implementation.
- File Storage Interface, Job Queues, Structured Logging.

**[Tier 3: Planned / Optional]**
Patterns available for implementation when needed.
- RBAC/Roles, Audit Log Entity, Settings, Activity Feed.

## 3. Tier 1 – Mandatory **[Core]**

### 3.1. Auth Module
Secure authentication mechanism with session management.

**Core Components (Implemented)**
- **Entities:** `User` (contains password hash, lock status), `UserSession` (refresh tokens).
- **Security:** Dual-token (Short-lived Access + Long-lived Refresh) with rotation.
- **Features:** Register, Login, Logout, Refresh Token, Email Verification, Password Reset, Account Locking.
- **Algorithm:** **Argon2** hashing & timing-safe comparison.

### 3.2. User Management
Identity representation.

**Core Components (Implemented)**
- **Entity:** `User` (id, email, name, status, timestamps).
- **Features:** "Me" profile endpoint, Profile Update.
- **Security:** JWT-based Identity Middleware (`req.user`).

### 3.3. Generic CRUD Pattern
Standardized patterns for data operations, pagination, and response formats.

**Implemented Standards**
- **Response:** `{ success, data, meta, message }` standardized wrapper.
- **Pagination:** Standard query params (`page`, `limit`) and meta response.
- **Error Handling:** Global exception handler with operational vs. programming error distinction.

### 3.4. Notification Infrastructure
Robust framework for sending asynchronous notifications.

**Core Components (Implemented)**
- **Queue:** BullMQ-based email queue with retries and DLQ (Dead Letter Queue).
- **Service:** `emailSender` abstraction (SMTP/Console drivers).
- **Workers:** Dedicated background workers for processing email jobs.

## 4. Tier 2 – Infrastructure **[Infra]**

### 4.1. File / Attachment Infrastructure
Abstraction for file handling.

**Current State**
- **Interface:** `FileStorage` interface defined for modularity.
- **Driver:** `LocalFileStorage` implemented for development.
- **Note:** Database entity for Files is currently not enforced, allowing flexibility based on business needs.

### 4.2. Observability Infrastructure
System visibility and debugging tools.

**Implemented**
- **Logger:** Pino (JSON structured logs) with redaction for sensitive data.
- **Correlation:** `x-request-id` tracking across logs and HTTP requests.
- **Health:** `/health` endpoint monitoring system and job queue status.

## 5. Tier 3 – Planned / Optional **[Opt]**

### 5.1. RBAC (Role-Based Access Control)
Permissions and Role management.
- **Status:** Policy-based structure exists in code (`acl.service.ts`), but DB Schema for Roles/Permissions is not yet enforced to keep the starter lightweight.

### 5.2. Audit Log
Forensic trail of actions.
- **Status:** Covered by Structured Logging (Tier 2). A dedicated database entity (`AuditLog`) is optional and can be added if strict compliance is required.

## 6. General Conventions
Rules for extending the boilerplate:

#### 6.1. Naming
Module names are lowercase (`auth`, `users`). Endpoint URLs are plural (`/api/v1/users`).

#### 6.2. Layering
Unidirectional flow: Routes → Controller → Service → Repository.

#### 6.3. API Contracts
Use standard HTTP codes and the defined JSON response envelope.

```json
// Success
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": { ... },
  "meta": { ... }, // Optional (Pagination)
  "requestId": "uuid"
}

// Error
{
  "success": false,
  "statusCode": 400,
  "message": "Validation Failed",
  "errors": [ ... ],
  "requestId": "uuid"
}
```

## 7. Implementation Checklist
Current status of the starter kit features.

### Core Features
- ✅ **Auth:** Register, Login, Refresh Token, Secure Headers.
- ✅ **Security:** Rate Limiting, Helmet, HPP, CORS.
- ✅ **User:** Basic Entity & Profile Management.
- ✅ **CRUD:** Base Patterns & Response Wrappers.
- ✅ **Jobs:** Queue System (BullMQ) & Workers.
- ✅ **Notif:** Email Sending Infrastructure.

### Infrastructure
- ✅ **Logging:** Structured JSON Logging.
- ✅ **Config:** Env Validation (Zod).
- 🚧 **File:** Storage Abstraction (Implemented), Upload Endpoint (Pending).
- 🚧 **Audit:** Via Logs (Implemented), Via DB Entity (Optional/Pending).

### Advanced
- ⬜ **RBAC:** Database-level Role Management.
- ⬜ **Settings:** Dynamic System Config.

---
Core Feature Handbook — Internal Developer Reference
