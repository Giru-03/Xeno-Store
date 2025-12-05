# Xeno Store - Multi-tenant Shopify Data Ingestion & Insights Service

## 📌 Project Overview
This project is a multi-tenant analytics platform designed to ingest data from Shopify stores (Orders, Products, Customers) and provide actionable insights via a dashboard. It supports multiple tenants (stores) with data isolation and includes a background worker for asynchronous data processing.

## ✨ Key Features
- **Multi-Tenant Architecture**: Secure data isolation for multiple Shopify stores.
- **Interactive Dashboard**:
  - **Date Range Filtering**: Analyze data for specific time periods (default: last 6 months).
  - **Drill-down Analytics**: Click on charts to view detailed data tables and graphs in a modal.
  - **Searchable Data**: Filter detailed records by date or status within the modal.
  - **Real-time Refresh**: Manually refresh data to get the latest insights.
- **Automated Ingestion**: Background workers sync historical data and listen for real-time webhooks.

## 🏗️ Architecture

The system follows a decoupled architecture with a separate frontend, backend API, and background worker service.

```mermaid
graph TD
    User[User (Browser)] -->|HTTPS| Frontend[Frontend (React + Vite)]
    Frontend -->|REST API| Backend[Backend API (Express.js)]
    
    subgraph "Backend Services"
        Backend -->|Auth & Queries| DB[(PostgreSQL)]
        Backend -->|Enqueue Jobs| Redis[(Redis)]
        Worker[Ingestion Worker] -->|Dequeue Jobs| Redis
        Worker -->|Fetch Data| Shopify[Shopify API]
        Shopify -->|Webhooks| Backend
        Worker -->|Upsert Data| DB
    end
```

### Tech Stack
- **Frontend**: React.js, Vite, TailwindCSS, Recharts, React-Hot-Toast
- **Backend**: Node.js, Express.js, Sequelize (ORM)
- **Database**: PostgreSQL
- **Queue**: Redis + BullMQ
- **Authentication**: JWT + Bcrypt

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (running locally or cloud)
- Redis (running locally or cloud)

### 1. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   DATABASE_URL=postgres://user:password@localhost:5432/xeno_store
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_super_secret_key
   ```
4. Start the server (this will also sync the database models):
   ```bash
   npm start
   ```
   *Note: To run the worker process, open a separate terminal and run `node workers/ingestionWorker.js` (or ensure your start script handles it).*

### 2. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login`: Authenticate a user and return a JWT.
- `POST /api/auth/register`: Register a new tenant (Store).

### Dashboard
- `GET /api/dashboard/stats`: Fetch aggregated statistics. Supports `startDate` and `endDate` query parameters for filtering.

### Data Sync
- `POST /api/sync/sync`: Trigger a background job to fetch historical data from Shopify.

### Webhooks
- `POST /webhooks/shopify`: Endpoint to receive real-time updates from Shopify (Orders, Products, Customers).

---

## 🗄️ Database Schema

The database uses a multi-tenant design where `TenantId` is a foreign key in all data tables.

### `Tenants`
- Stores authentication details and configuration for each Shopify store.
- **Fields**: `id`, `shopifyDomain`, `accessToken`, `shopName`, `email`, `password`.

### `Customers`
- Stores customer profiles.
- **Fields**: `id`, `shopifyCustomerId`, `firstName`, `lastName`, `email`, `totalSpent`, `TenantId`.

### `Orders`
- Stores order details.
- **Fields**: `id`, `shopifyOrderId`, `totalPrice`, `financialStatus`, `createdAt`, `TenantId`, `CustomerId`.

### `Products`
- Stores product information.
- **Fields**: `id`, `shopifyProductId`, `title`, `price`, `TenantId`.

---

## ⚠️ Known Limitations & Assumptions

### Shopify API Access & PII
- **API access to personally identifiable information (PII)** like customer names, addresses, emails, and phone numbers is available on **Shopify, Advanced, and Plus plans**.
- On lower-tier plans (like Basic), this data may be redacted by Shopify in API responses.
- **Mitigation**: We have implemented a fallback strategy for customer names:
  1. Use `first_name` / `last_name` from the customer object.
  2. Fallback to `default_address` name if available.
  3. Fallback to extracting the name from the `email` address.
  4. Final fallback to "Customer #ID".

### Data Synchronization
- **Historical Data**: The "Sync" button triggers a full fetch of historical data. This is an expensive operation and is handled asynchronously via Redis queues.
- **Real-time Updates**: The system relies on Shopify Webhooks for real-time updates. If webhooks fail or are missed (e.g., server downtime), a manual Sync is required to catch up.
