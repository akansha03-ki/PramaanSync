# PramaanSync — Multi-Vendor DVR/NVR Forensic Analysis Platform

PramaanSync is a full-stack digital forensics platform built for law enforcement agencies to acquire, verify, and analyze surveillance footage from multi-vendor DVR/NVR hardware (Hikvision, Dahua, CP Plus).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- npm

### 1. Installation
Install dependencies for both backend server and React client:
```bash
# Install root, server, and client dependencies
npm run setup
```

### 2. Database & Seeding
Seed the database with law enforcement users, multi-vendor cameras, geospatial locations, sample video evidence files, and timeline events:
```bash
# Seed initial demo data
npm run seed
```

### 3. Run Development Platform
Launch both backend Express API (Port 5000) and Vite React frontend (Port 3000) concurrently:
```bash
npm run dev
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Law Enforcement Accounts

The system comes pre-seeded with four role-based accounts (Password for all accounts: `DemoPass123!`):

| Role | Email | Badge ID | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@pramaan.gov.in` | `BADGE-ADM-001` | Full Access + Secure Export Gate + KMS Key Rotation |
| **Inspector** | `inspector@pramaan.gov.in` | `BADGE-INSP-402` | Upload Evidence + Recovery Pipeline + View Logs |
| **Investigator** | `investigator@pramaan.gov.in` | `BADGE-INV-889` | Ingest Streams + Sync View + Cross-Verify |
| **Researcher** | `researcher@pramaan.gov.in` | `BADGE-RES-104` | Read-only analytics & metadata inspection |

*Note: Quick demo buttons are available on the login page for instantaneous role switching.*

---

## 🗄️ Database Setup & Memory Server Fallback

> [!IMPORTANT]
> **Zero-Config Demoing vs Persistent Storage**:
> The backend connects to standard MongoDB if `MONGO_URI` is provided in environment variables. If omitted or unreachable, it automatically initializes an in-memory database fallback (`mongodb-memory-server`) for zero-config demonstration.
> 
> **CAVEAT**: `mongodb-memory-server` is for **zero-config demoing only** and does **NOT persist data between restarts**. For production or persistent data storage, `MONGO_URI` must be set.

---

## 🧪 Automated OEM Parser CI Test Suite

Run the automated CI parser test suite to evaluate adapters against synthetic test fixtures:
```bash
npm run test:adapters
```
> [!NOTE]
> **Synthetic Test Fixtures**: The sample dumps tested in `ParserTestSuite.js` are **synthetic test fixtures** generated for parser validation rather than real proprietary hardware recordings.

---

## ⚠️ Scope & Limitations

This section explicitly documents what components are full production implementations vs. architectural demonstrations:

### ✅ Full Implementations
- **Authentication & RBAC**: JWT token authentication with bcryptjs password hashing and strict middleware role enforcement (`Admin`, `Inspector`, `Investigator`, `Researcher`).
- **Cryptographic SHA-256 Hashing**: Server-side SHA-256 hash generation computed via Node.js `crypto` module directly on file ingestion (the root of chain of custody).
- **Chain of Custody Timeline**: Automated timeline event logging (captured → uploaded → hash generated → integrity verified).
- **Evidence Management**: Full CRUD operations for evidence files, metadata indexing, and file serving.
- **Admin Secure Export Gate**: Secondary passphrase-gated export portal (`SECURE_EXPORT_PASSPHRASE`), AES-256 encrypted zip package builder, and hash-chained export logs.
- **Multi-Camera Sync View**: Multi-pane playback alignment with clock drift correction sliders and frame cross-verification report builder.
- **Geospatial Camera Mapping**: Interactive Leaflet map with pin plotting, camera density heatmap layers, and locality side drawers.

### 📐 Architectural Demonstrations / Prototype Caveats
- **OEM Adapter Layer**: Detection is **magic-byte/header based for prototype purposes** (inspecting signatures like `HIKV`, `DHAV`, `CPPL`); full proprietary hardware codec decoding is out of scope for this build.
- **KMS Service**: Implements a **KMS-pattern implementation (HMAC/RSA-based, application-level)** for prototype purposes, utilizing application-level key generation, rotation, revocation, and signing rather than hardware-backed HSM or cloud KMS infrastructure.
- **Physical DVR Drive Acquisition**: Simulates write-blocked forensic drive connection, raw partition stream hashing, and disk image extraction.
