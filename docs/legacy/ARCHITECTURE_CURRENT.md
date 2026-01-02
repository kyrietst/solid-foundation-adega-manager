# Adega Manager - Technical Architecture
**Version:** 3.2.0 (December 2025)

## 🏗️ System Overview
Adega Manager is a modern, enterprise-ready wine cellar management system built on a **Supabase (PostgreSQL)** backend and a **React 19** frontend.

## 🔒 Security Architecture (Hardened)
The system implements a rigorous "Secure by Default" security model, significantly hardened in Dec 2025:

### 1. Database Security (RLS)
- **Role Level Security (RLS):** Enabled and enforced on ALL public tables. 
- **Policies:** Granular access policies control read/write operations based on user roles (`authenticated`, `service_role`).
- **Data Isolation:** Tenants/Users are strictly isolated at the database row level.

### 2. Function Security
- **Search Path:** All PL/PGSQL functions in the `public` schema have an explicit `SET search_path = public, pg_temp` configuration to prevent search path hijacking (CVE remediation).

### 3. API Exposure
- **Materialized Views:** Sensitive analytical views (`mv_financial_kpis`, etc.) are NOT exposed to the public API (`anon` role). Access is restricted to trusted server-side execution or specific authenticated roles.

## ⚡ Performance Architecture
- **Indexing:** 
  - Comprehensive B-Tree indexes on all Foreign Keys.
  - GIN indexes (via `pg_trgm`) for high-performance fuzzy search on Product Names and Customer Names.
- **Realtime (Smart Sync) [NEW 12/2025]:** 
  - **Hybrid Architecture:** Combines aggressive cache (5min staleTime) with Supabase Realtime event listeners.
  - **Sentinel Hook:** `useRealtimeSync` acts as a global listener for `postgres_changes` on critical tables (`products`, `sales`, `customers`).
  - **Aggressive Invalidation:** Uses `resetQueries` with partial matching (`exact: false`) to instantly refresh all UI components (Stock, POS, Dashboard) upon server-side changes.
- **Caching:** React Query is used for aggressive frontend caching and stale-while-revalidate patterns.

## 💻 Frontend Architecture
- **Framework:** React 19.1.1 (Vite)
- **Language:** TypeScript (Strict Mode)
- **State Management:** Zustand (Global Store) + React Query (Server State).
- **UI Library:** Aceternity UI / TailwindCSS.
- **Key Patterns:**
  - **Single Source of Truth (SSoT):** Centralized business logic in custom hooks.
  - **SuperModal:** Unified modal management system.

## 🗄️ Database Schema
- **Platform:** Supabase (PostgreSQL 15+)
- **Extensions:** `pg_trgm`, `uuid-ossp`.
- **Key Tables:** `sales`, `sale_items`, `products`, `inventory_movements`, `customers`, `users`, `store_settings`.

## 🔄 Deployment
- **Frontend:** Vercel / Netlify (SPA Mode).
- **Backend:** Supabase Managed Instance.
- **CI/CD:** Manual migrations controlled via `supabase-dev` and `supabase-prod` tools.
