# Adega Manager

**Enterprise Wine Cellar Management System**

![Status](https://img.shields.io/badge/Status-Production-green)
![Security](https://img.shields.io/badge/Security-Hardened-blue)
![Version](https://img.shields.io/badge/Version-3.2.0-purple)

## 🚀 Overview
Adega Manager is a high-performance system designed for managing wine cellars and liquor stores. It features a complete POS, intelligent inventory management, CRM, and advanced logistics.

## 📚 Documentation (New SSoT)
The documentation has been audited and updated (Dec 2025). Please refer to the following files for the most up-to-date information:

- **[Current Project Status](docs/CURRENT_STATUS.md)**: The "Control Panel" showing what's built, what's secure, and what's pending.
- **[Technical Architecture](docs/ARCHITECTURE_CURRENT.md)**: Deep dive into the Security (RLS), Performance, and Frontend stack.
- **[Legacy Archive](docs/10-legacy/)**: Historical design docs and logs.

## 🛠️ Quick Start

### Prerequisites
- Node.js 20+
- Supabase Project

### Installation
```bash
npm install
npm run dev
```

## 🔒 Security
This project follows strict security guidelines:
- **RLS Enabled:** All tables are protected.
- **Secure Functions:** `search_path` is explicitly set.
- **No Public Analytics:** Materialized views are private.

## 🚧 Known Issues / Pending
- **Fiscal Integration:** The `products` table requires schema updates for NCM/CFOP support (See [CURRENT_STATUS.md](docs/CURRENT_STATUS.md)).

---
*Maintained by Antigravity*