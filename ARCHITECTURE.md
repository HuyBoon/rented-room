# Project Architecture: RentedRoom (Modular Clean Architecture)

This document outlines the architectural principles and structural patterns of the RentedRoom platform.

## Core Principles

1. **Modular Design**: Each domain (Buildings, Rooms, Invoices, Tenants) is encapsulated in its own module to ensure separation of concerns.
2. **Standardized Communication**: All modules interact via consistent Service layers and standard API responses.
3. **Type Safety**: Full-stack TypeScript enforcement from database models to frontend components.

## Directory Structure

```text
src/
├── app/                  # Next.js App Router (Routes & UI)
│   ├── (auth)/           # Authentication routes (Login/Register)
│   ├── (dashboard)/      # Admin dashboard management
│   ├── tenants/          # Tenant-facing portal
│   └── api/              # API Route Handlers
├── modules/              # Core Business Logic (Domain Layer)
│   ├── buildings/        # Building management logic
│   ├── rooms/            # Room & Inventory logic
│   ├── invoices/         # Billing & Calculation engine
│   └── tenants/          # Resident & CRM logic
├── components/           # UI Components
│   ├── ui/               # Primary UI primitives (shadcn/ui)
│   ├── layout/           # Shared layout components (Header/Footer)
│   └── shared/           # Reusable business-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Shared utilities and configurations
├── models/               # Domain Models (Mongoose/Prisma)
└── types/                # Global TypeScript definitions
```

## Data Flow Pattern

1. **Frontend**: React components utilize `fetch` or custom hooks.
2. **API Layer**: Next.js Route Handlers (`src/app/api/.../route.ts`) parse requests.
3. **Service Layer**: Business logic is executed in `src/modules/.../service.ts`.
4. **Data Access**: Mongoose models (`src/modules/.../model.ts`) interact with MongoDB.
5. **Standardized Response**: All APIs return a consistent `JSON` structure:
   ```json
   {
     "success": true,
     "data": { ... },
     "message": "Operation successful"
   }
   ```

## Design Aesthetics

The project utilizes a **Premium Glassmorphism** aesthetic:
- **Primary Color**: Indigo-600
- **Background**: Slate-50 with subtle gradients and backdrop-blur effects.
- **Typography**: Inter / Outfit for high readability.
- **Icons**: Lucide-React.
