# FarmFlow

## SIH 2026 Project

# Team -- REWAK
# TEAM LEADER --> AYUSH VINOD NAMBOODIRI
# TEAM NUMBER --> 217

FarmFlow is a digital procurement support platform for farmers and government procurement centers. It helps farmers book slots, find nearby centers, track produce acceptance, receive alerts, view payments, and raise grievances without depending on repeated visits or unclear paper-based updates.

## Problem

Farmers often face long queues, uncertain procurement status, delayed payments, and limited visibility into grading decisions. Procurement officers also need a single operational view for centers, bookings, produce, alerts, grievances, and reports.

## Solution

FarmFlow connects a farmer-facing portal with an admin operations portal:

- Farmers book and manage procurement slots.
- Farmers find nearby centers using browser GPS and map links.
- Farmers receive prominent alerts and live produce status updates.
- Procurement officers record produce, grading, accepted quantity, deductions, and status changes.
- The system calculates estimated value using configured crop rates and quality deductions.
- Farmer credit scores are updated from accepted quantity and quality outcomes.
- Admins monitor centers, farmers, procurement, reports, alerts, and grievances.

## Main Features

### Farmer Portal

- Email and password login
- Farmer registration
- Dashboard with booking, produce, payment, and alert summaries
- Slot booking, booking list, cancellation, and rescheduling
- GPS-based nearby procurement centers
- Google Maps links for centers
- Live Status timeline: Received, Graded, Accepted, Processing, and Paid
- Red homepage alerts for unread admin messages
- Grievance submission
- Payment and produce tracking

### Admin Portal

- Admin login and government-center signup
- Live dashboard KPIs
- Farmer list with live farmer records and credit scores
- Procurement-center management
- Slot and booking visibility
- Receive Produce workflow
- Grade and accepted-quantity recording
- Quality deductions and estimated payment calculation
- Procurement status updates with event ticks
- Farmer-by-farmer live status view
- Broadcast and targeted farmer alerts
- Live reports and analytics

## Technology Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Recharts
- PHP 8+
- MySQL
- Apache through XAMPP

## Architecture

```text
Next.js / React frontend
          |
          | JSON HTTP API
          v
PHP endpoints in XAMPP htdocs
          |
          v
MySQL database: farmerflow
```

The frontend API URL is configured in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost/farmflow-api
```

## Local Setup

### Requirements

- Node.js 20+
- npm
- XAMPP with Apache, PHP, and MySQL
- A MySQL database named `farmerflow`

### Start the frontend

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. If that port is already in use, Next.js may use another available port such as 3001.

### Configure PHP in XAMPP

Copy the project `php` directory into the active XAMPP Apache document root:

```text
C:\xampp\htdocs\farmflow-api
```

The folder should contain these API files:

```text
db.php
login.php
register.php
centers.php
farmers.php
bookings.php
save.php
grievance.php
alerts.php
procurements.php
create-procurement.php
dashboard.php
reports.php
```

Update `php/db.php` with your local MySQL connection values, then start Apache and MySQL from XAMPP.

Test the connection at:

```text
http://localhost/farmflow-api/test-connection.php
```

Expected response:

```json
{"connected":true,"message":"PHP is connected to MySQL."}
```

### Database

The main database is `farmerflow`. Core tables include:

- `users`
- `farmers`
- `centers`
- `time_slots`
- `bookings`
- `procurements`
- `procurement_events`
- `payments`
- `grievances`
- `alerts`
- `alert_reads`
- `market_prices`

Do not commit database passwords or private production credentials.

## Useful Routes

### Farmer

- `/farmer`
- `/farmer/book`
- `/farmer/bookings`
- `/farmer/live-status`
- `/farmer/recommend`
- `/farmer/notifications`
- `/farmer/grievances`
- `/farmer/payments`

### Admin

- `/admin`
- `/admin/farmers`
- `/admin/centers`
- `/admin/slots`
- `/admin/procurement`
- `/admin/payments`
- `/admin/grievances`
- `/admin/reports`
- `/admin/alerts`
- `/admin/settings`

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint
npx tsc --noEmit # Run TypeScript type checking
```

## Project Structure

```text
src/
  app/             Next.js pages and role-based portals
  components/      Shared layouts and UI components
  lib/             Types, API helper, store, translations, and utilities
php/               XAMPP PHP API endpoints
public/            Static assets
```

## Team Notes

FarmFlow is designed as an SIH 2026 prototype with a clear path toward production deployment. A production release should add secure server-side sessions or tokens, role-based authorization on every API endpoint, request validation, audit logs, migration scripts, and verified government crop-price sources.
