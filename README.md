# 🍲 Food Surplus Management System

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs)
![Express](https://img.shields.io/badge/Express.js-4.x-white?style=for-the-badge&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

An enterprise-grade, role-based ecosystem engineered to bridge the gap between food surplus and scarcity. FSMS provides a cryptographically secure, auditable supply chain that empowers hotels, restaurants, and grocery stores to route excess inventory to verified NGOs and community kitchens.

---

## 📌 Project Overview

The Food Surplus Management System addresses logistical inefficiencies in food redistribution. Moving beyond static bulletin boards, FSMS introduces a highly interactive, animated, and tightly governed platform. Every transaction—from initial inventory logging to physical delivery—is immutably tracked, ensuring complete Corporate Social Responsibility (CSR) accountability and systemic waste reduction.

**Core Objectives:**
* **Systemic Waste Reduction:** Transform localized food surplus into targeted community resources.
* **Auditable Integrity:** Enforce strict Role-Based Access Control (RBAC) and compliance reviews.
* **Real-Time Telemetry:** Provide global oversight through live, dynamic data aggregation.

---

## ✨ Core Features by Role

The platform architecture is divided into strictly isolated operational environments based on user roles.

### 🌐 Global System Capabilities
* **Strict Verification Protocol:** No public registration. All entities must submit an intake application for manual compliance review before provisioning.
* **Live Telemetry Engine:** Public-facing, dynamic metrics (People Served, Kg Donated) automatically calculated via backend aggregation queries.
* **Automated Expiration Handling:** Query-level data filtration ensures expired inventory is globally invisible and safely purged from active circulation without manual intervention.
* **Standardized Data Formatting:** Enforced sanitization (e.g., auto-capitalization, strict `10XXXXX` phone masking) across all ingress points.

### 🏢 Food Donors (Hotels, Superstores)
* **Canonical Inventory Management:** Log surplus batches with precise units, quantities, and strict expiration dates.
* **Automated Batching:** System-assigned batch numbers (e.g., `B23`) for granular tracking.
* **Semantic Status Indicators:** UI dynamically updates batch warnings (Active, Warning, Critical) based on time-to-expiration.

### 🤝 Food Receivers (NGOs, Kitchens)
* **Dispatch Requests:** Broadcast urgent resource requirements (Standard, Elevated, Critical) to the network.
* **Time-Gated Logbooks:** Record daily meal distributions (Lunch/Dinner). Shifts are mathematically locked to specific operational time windows (e.g., Lunch locks at 2:00 PM) to ensure data integrity.
* **Deficit Tracking:** Automated calculation of estimated vs. served meals.

### 🚚 Delivery Personnel
* **Logistics Routing:** Securely accept delivery pledges and update transit statuses (`LOCKED`, `IN_TRANSIT`, `COMPLETED`, `FAILED`).
* **Duty Status Toggle:** Real-time visibility controls for network availability.

### 🛡️ System Coordinators & Lead Devs
* **Identity & Access Management:** Provision, edit, and purge network participants.
* **Environment Sandbox:** Bypass authority to view and interact with all role-specific dashboards for debugging and oversight.
* **Compliance Review:** Evaluate and approve/reject inbound organizational applications.

---

## 🛠️ System Architecture & Technologies

The project utilizes a modern, decoupled monorepo architecture.

### **Frontend (Presentation Layer)**
* **Framework:** Next.js (App Router) / React 18
* **Styling:** Tailwind CSS (Modern SaaS aesthetic, rounded-xl, soft drop-shadows)
* **State Management:** Zustand (Global user session & telemetry state)
* **Component Library:** Custom-built UI components with `lucide-react` iconography.
* **Animations:** `react-countup` and custom CSS keyframes for cinematic, 300ms transitions.

### **Backend (Aggregation & Logic Layer)**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** PostgreSQL
* **ORM:** Prisma (Schema-driven migrations and type-safe querying)
* **Validation:** Zod (Strict payload verification matching frontend schema rules)

---

## 📂 Repository Structure

```text
food-surplus-management/
├── client/                     # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                # App Router (Pages, Layouts, APIs)
│   │   ├── components/         # Reusable UI, Layout, and Widget components
│   │   ├── store/              # Zustand state stores
│   │   └── utils/              # Frontend helpers & validators
│   ├── public/                 # Static assets
│   ├── tailwind.config.ts      # Design system configuration
│   └── package.json
│
├── server/                     # Express/Node.js Backend Application
│   ├── prisma/
│   │   └── schema.prisma       # Database schema and relational mapping
│   ├── src/
│   │   ├── controllers/        # Core business logic (Auth, Inventory, Telemetry)
│   │   ├── middleware/         # JWT Verification, RBAC Guards, Error Handling
│   │   ├── routes/             # API Endpoint definitions
│   │   └── utils/              # Prisma client instantiation, Zod schemas
│   └── package.json
│
├── .gitignore                  # Standardized monorepo ignore rules
└── README.md
```

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed in your local development environment:
* **Node.js** (v18.x or v20.x recommended)
* **PostgreSQL** (v15 or higher)
* **npm** or **yarn**

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Bipul-Das/food-surplus-management.git](https://github.com/Bipul-Das/food-surplus-management.git)
   cd food-surplus-management
   ```
2. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```
3. **Install Frontend Dependencies:**
   ```bash
   cd ../client
   npm install
   ```
4. **Environment Configuration:**
   * Navigate to the `server` directory and create a `.env` file.
   * Add the following required variables:
     ```env
     PORT=5000
     DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/food_surplus_db?schema=public"
     JWT_SECRET="your_cryptographically_secure_secret_key"
     ```
### Running the Application

1. **Initialize the Database (Server):**
   Open a terminal in the `server` directory and execute the Prisma migrations to build your database schema:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```
2. **Start the Backend Server:**
   While still in the `server` directory, start the development server:
   ```bash
   npm run dev
   ```
   The API will boot and listen on `http://localhost:5000`.

3. **Start the Frontend Client:**
   Open a **new** terminal window, navigate to the `client` directory, and start the Next.js development server:
   ```bash
   cd client
   npm run dev
   ```
   The application will compile and become available at `http://localhost:3000`.

## 🛡️ Security Implementation Notes

The system architecture prioritizes data integrity and absolute security through a multi-layered defense strategy.

* **Payload Validation:** Every API ingress point is strictly governed by **Zod schemas**. This ensures that all inbound data is validated for type, length, and format before it ever interacts with the business logic or the Prisma ORM layer.
* **Authentication:** The platform utilizes **Stateless JWT (JSON Web Tokens)** to handle session verification. These cryptographically signed tokens are required for all non-public routes and are rigorously verified via custom Express middleware.
* **Route Protection:** The frontend architecture implements a robust Higher-Order Component (HOC) pattern. The `<ProtectedRoute allowedRoles={[...]} />` component enforces strict **Role-Based Access Control (RBAC)**, preventing unauthorized view rendering and ensuring users only access permitted operational environments.
* **Data Sanitization & Symmetry:** To maintain high-quality data and visual consistency, all forms implement automatic sanitization. The system programmatically trims leading/trailing whitespace and enforces title-casing for entity names, mitigating database pollution and ensuring a polished, professional UI.
