# VaultShield AI 🛡️
> Enterprise Autonomous PII Anonymization & Compliance Ledger

VaultShield is a privacy-preserving security tool designed to automatically scan, sanitize, and mask Sensitive Personally Identifiable Information (PII) from JSON database dumps and CSV datasets before sending payloads to third-party LLMs or analytics pipelines.

## 🌐 Live Deployments
* **Frontend Application (Vercel):** [vaultshield-omega.vercel.app]
* **Backend API Service (Render):** [https://vaultshield-6mkn.onrender.com]

## 🚀 Key Features
- **Multi-Format Ingestion:** Native support for both `.json` and `.csv` files.
- **Configurable Anonymization Strategies:** Switch between *Pseudonymization* (realistic fake data) and *Full Redaction* (`[REDACTED]`).
- **MongoDB Audit Ledger:** Cryptographic compliance logs stored permanently in MongoDB Atlas for GDPR & DPDP compliance verification.
- **Side-by-Side Diff & Cyberpunk Terminal:** Live visual diff comparison view and real-time execution log terminal stream.
- **Dynamic Export Downloader:** Format-aware exporter downloading clean `.json` or `.csv` files.
- **JWT Authentication:** Secure enterprise user authentication gateway.

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Tailwind CSS v3, Framer Motion, Lucide Icons
- **Backend:** Node.js, Express, Multer, CSV-Parser, BcryptJS
- **Database:** MongoDB Atlas / Mongoose

## 🔧 Local Setup & Run

### 1. Clone & Backend Setup
```bash
cd backend
npm install
node server.js