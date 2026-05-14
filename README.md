# 🏭 Enterprise Warehouse Management System (WMS)

A full-stack, cloud-ready Warehouse Management System built with **Java Spring Boot**, **PostgreSQL**, and **React.js**. Designed to automate core warehouse operations including real-time inventory tracking, receiving & putaway, and order fulfillment.

---

## 📸 Features

- 📊 **Dashboard** — Live KPIs: total warehouses, SKUs, orders, pending & shipped counts
- 🏭 **Warehouse Management** — Create and manage multiple warehouse locations
- 📦 **Inventory Management** — Track SKUs, adjust stock, generate QR codes for floor scanning
- 🚚 **Receiving & Putaway** — Log inbound shipments with auto bin assignment based on capacity
- 🛒 **Order Fulfillment** — Full order lifecycle: `PENDING → PICKING → PACKED → SHIPPED`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.2 |
| Database | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| Frontend | React.js 18, React Router |
| HTTP Client | Axios |
| Barcode/QR | ZXing Library |
| Build Tool | Maven |

---

## 📁 Project Structure

```
wire/
├── wms-backend/          # Spring Boot REST API
│   ├── src/main/java/com/wms/
│   │   ├── controller/   # REST Controllers
│   │   ├── service/      # Business Logic
│   │   ├── repository/   # JPA Repositories
│   │   ├── entity/       # Database Entities
│   │   └── dto/          # Data Transfer Objects
│   └── pom.xml
│
└── wms-frontend/         # React Application
    ├── src/
    │   ├── api/          # Axios API calls
    │   ├── components/   # Reusable components
    │   └── pages/        # Dashboard, Inventory, Orders, Receiving, Warehouses
    └── package.json
```

---

## 🗄️ Database Schema

```
Warehouse
  └── Zone
        └── Aisle
              └── Bin
                    └── InventoryItem (SKU)

Order
  └── OrderLine → InventoryItem

Shipment
  └── ShipmentLine
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Maven 3.9+
- PostgreSQL 15+
- Node.js 18+

### 1. Clone the repository

```bash
git clone https://github.com/aayushverdhan/warehouse-management-system.git
cd warehouse-management-system
```

### 2. Setup the Database

Open pgAdmin or psql and run:

```sql
CREATE DATABASE wms_db;
```

### 3. Configure the Backend

Copy the example config file:

```bash
cp wms-backend/src/main/resources/application.properties.example wms-backend/src/main/resources/application.properties
```

Edit `application.properties` and set your PostgreSQL password:

```properties
spring.datasource.password=YOUR_POSTGRES_PASSWORD
```

### 4. Run the Backend

```bash
cd wms-backend
mvn spring-boot:run
```

Backend starts at **http://localhost:8080**

Hibernate will automatically create all database tables on first run.

### 5. Run the Frontend

```bash
cd wms-frontend
npm install
npm start
```

Frontend starts at **http://localhost:3000**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard` | Live KPI statistics |
| GET / POST | `/api/warehouses` | List / create warehouses |
| GET / POST | `/api/inventory` | List / create inventory items |
| PATCH | `/api/inventory/adjust` | Adjust stock quantity |
| GET | `/api/inventory/qr/{sku}` | Generate QR code for SKU |
| GET / POST | `/api/orders` | List / create orders |
| PATCH | `/api/orders/{id}/advance` | Advance order status |
| GET / POST | `/api/shipments` | List / receive shipments |

---

## 🔒 Key Technical Highlights

- **Pessimistic Locking** — Prevents race conditions during concurrent stock updates
- **ACID Transactions** — All inventory movements are fully transactional
- **Auto Schema Creation** — Hibernate creates all 9 tables automatically on startup
- **QR Code Generation** — Server-side QR codes via ZXing, returned as Base64 images
- **Optimized Putaway** — Auto-assigns items to bins with best available capacity

---

## 📄 License

This project is for educational purposes.
