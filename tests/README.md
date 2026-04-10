# Testing Strategy

To ensure the long-term reliability of our Motel Management System, we use a testing strategy that focuses on accuracy and developer speed.

## 🧪 Recommended Tools

- **Vitest**: The recommended test runner for Next.js projects. It's extremely fast and compatible with Jest APIs.
- **Supertest**: For testing API endpoints without running the full server.
- **Playwright**: For End-to-End (E2E) testing of critical user flows (e.g., Booking, Payment).

## 📁 Directory Structure

```text
tests/
├── unit/           # Business logic tests for modules
├── integration/    # API endpoint tests
└── e2e/           # Playwright browser tests
```

## 🏗 Setup Instructions (Draft)

To initialize the testing environment:

1.  **Install dependencies**:
    `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react`

2.  **Add a test script** to `package.json`:
    `"test": "vitest"`

3.  **Write your first test** in `src/modules/invoice/controller.test.ts`.

## ✅ Test Checklist

- **Logic**: Ensure financial calculations in `BillingService` are accurate.
- **Access Control**: Verify that unauthorized users cannot access protected API routes.
- **Model Validation**: Test that Zod schemas correctly catch invalid data.
