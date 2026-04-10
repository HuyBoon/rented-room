# Motel Management System (Hệ thống quản lý phòng trọ)

A modern, professional, and comprehensive Motel Management System built with **Next.js 15**, **TypeScript**, and **MongoDB**. This project has been refactored into a high-performance **Modular Architecture** to ensure scalability and maintainability.

## 🏗 Modular Architecture (Kiến trúc Module)

The system is organized into self-contained feature modules under `src/modules/`. Each module encapsulates its own data model, business logic (Controllers), and specialized services.

- **`User`**: Identity, Profile, and Role-Based Access Control.
- **`Building`**: Physical property management and amenities.
- **`Room`**: Unit management, real-time status tracking, and floor organization.
- **`Tenant`**: Profile management, identity verification, and authentication.
- **`Contract`**: Rental agreements, lifecycle management, and file storage.
- **`Invoice`**: Financial billing, complex calculations, and automated recurring cycles.
- **`Payment`**: Transaction processing and receipt generation.
- **`Issue`**: Incident reporting and tracking.
- **`MeterReading`**: Utility (Electricity/Water) consumption tracking.

## 🚀 Key Features (Tính năng chính)

### 📊 Dashboard & Analytics
- Overview of rooms, revenue, and active invoices.
- Monthly revenue charts with Recharts.
- Tracking of overdue invoices, maintenance issues, and expiring contracts.

### 🏢 Property Management
- Comprehensive building and room management with image uploads.
- Real-time room status syncing (Available, Occupied, Maintenance).
- Global and unit-level amenity management.

### 🧾 Automated Billing & Finance
- Automated invoice generation based on utility meter readings.
- Complex calculation engine for electricity, water, and service fees.
- Payment tracking with evidence upload and digital receipts.

### 👥 Resident Management
- Detailed tenant profiles with identity document storage.
- Contract history and payment logs for every resident.
- Multi-channel notification system for billing and announcements.

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router / Turbopack)
- **UI Components**: Shadcn/UI
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form + Zod
- **Visuals**: Framer Motion (Animations), Recharts (Analytics)

### Backend
- **Architecture**: Modular Controller/Service Pattern
- **Authentication**: Auth.js (NextAuth) v5 (JWT + Session)
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod (Schema-first validation)

## 📦 Getting Started (Cài đặt)

### Prerequisites
- Node.js 18+ (Recommended: Node.js 20+)
- MongoDB connection string
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd demo-phong-tro
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file (refer to `env.example`):
   ```env
   MONGODB_URI=your_mongodb_uri
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXT_PUBLIC_CLOUD_NAME=your_cloudinary_name
   NEXT_PUBLIC_UPLOAD_PRESET=your_upload_preset
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🌿 Development Workflow

We follow professional engineering standards:
- **Git Strategy**: Use `develop` for integration and `feature/*` for development. `main` is reserved for stable releases.
- **Commit Standards**: We follow [Conventional Commits](https://www.conventionalcommits.org/).
- **Guides**: Refer to [CONTRIBUTING.md](CONTRIBUTING.md) and [tests/README.md](tests/README.md) for more details.

## 📄 License
Distributed under the MIT License.