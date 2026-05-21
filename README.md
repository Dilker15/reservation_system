<div align="center">

# Place Reservations API

**REST API for a short-term rental platform.**
Property listing, availability management, and payment processing for owners and guests.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![AWS ECS](https://img.shields.io/badge/AWS_ECS-FF9900?style=flat-square&logo=amazonaws&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white)

</div>

---

## Overview

Place Reservations is a backend API that powers a short-term rental marketplace. Owners can list unique properties, configure their availability calendar, and connect payment accounts to receive direct payments. Guests can browse listings, check availability, and complete bookings through a secure, webhook-verified payment flow.

The project was built as a portfolio piece to demonstrate production-level backend patterns: async job queues, cache strategies, webhook validation, split payments, and an automated CI/CD pipeline deploying to AWS ECS with Fargate.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Key Technical Decisions](#key-technical-decisions)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [CI/CD Pipeline](#cicd-pipeline)
- [Author](#author)

---

## Features

### For Guests
- Browse and filter properties by type, location, price, and availability
- View property details with photos and location on Google Maps
- Check real-time availability calendar per property
- Pay via Stripe or Mercado Pago (redirect to hosted checkout)
- Receive email confirmation once payment is verified
- View and manage personal reservation history

### For Owners
- Publish and manage property listings (cabin, treehouse, tiny house, dome, chalet, and more)
- Configure availability slots per property
- Connect Stripe and/or Mercado Pago accounts to receive payments directly (OAuth)
- View analytics and earnings per property
- Receive email notification on each confirmed reservation

### Platform
- Role-based access control (RBAC) — `client` and `owner` roles have strictly separated permissions; every protected endpoint is guarded by a role guard using a custom `@Roles()` decorator
- Webhook-based payment verification (signature validation for both Stripe and Mercado Pago)
- Split payments: platform fee deducted automatically at checkout (Stripe Connect fully functional; Mercado Pago split ready, pending sandbox restrictions)
- Automatic reservation expiration: unpaid reservations cancelled after 10 minutes via background worker
- Idempotency keys on critical operations (payments, place creation, account deletion) to prevent duplicate processing
- Email verification on signup for both roles
- Unified response format across all endpoints

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client / Frontend                         │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS
┌───────────────────────────────▼─────────────────────────────────┐
│                   NestJS API  (AWS ECS / Fargate)                │
│                                                                  │
│   Guards → Interceptors → Controllers → Services                │
│                                                                  │
│  ┌─ Business Domain ──────────────────────────────────────────┐ │
│  │  Auth · Users · Places · Reservations · Locations          │ │
│  │  OpeningHours · BookingMode · Amenities · Categories        │ │
│  │  Countries · Analytics · PaymentAccounts                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Payments ─────────────────────────────────────────────────┐ │
│  │  Strategy Pattern → Stripe Connect · Mercado Pago           │ │
│  │  Webhook validation → Reservation state update              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Infrastructure ───────────────────────────────────────────┐ │
│  │  Emails · ImageUpload · QueueBull · CacheRedis              │ │
│  │  TokenEncryption · BullMQ Workers                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │                    │                    │
┌─────────▼──────┐   ┌─────────▼──────┐   ┌────────▼──────────┐
│  PostgreSQL    │   │     Redis       │   │    Cloudinary     │
│  (TypeORM)    │   │ (Cache + Queue) │   │  (Image Storage)  │
└────────────────┘   └────────────────┘   └───────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (TypeScript) |
| Database | PostgreSQL + TypeORM |
| Cache & Queues | Redis + BullMQ |
| Payments | Stripe Connect, Mercado Pago |
| Media Storage | Cloudinary (S3-ready via Strategy pattern) |
| Maps | Google Maps API |
| Mail | Nodemailer + SMTP |
| Logging | Winston |
| Testing | Jest (unit tests) |
| Containerization | Docker + Docker Compose (multi-stage build) |
| CI/CD | GitHub Actions |
| Cloud | AWS ECS with Fargate + ECR |

---

## Key Technical Decisions

### Role-based Access Control (RBAC)
Each route is protected by a combination of a JWT auth guard and a role guard. The JWT payload includes the user's role at sign-in. A custom `@Roles()` decorator is applied at the controller level to declare which role is required. The role guard reads the decorator metadata and compares it against the token payload — rejecting the request before it reaches the handler if there is a mismatch. This keeps authorization logic out of service classes and makes permissions visible at the route declaration.

### Strategy Pattern for Payments
Stripe and Mercado Pago share a common interface. Adding a new payment provider requires implementing the interface — no changes to existing code. The same pattern is applied to image storage (Cloudinary today, S3 tomorrow).

### Webhook-verified Payment Flow
Payments are never trusted on the frontend. The flow is: client redirects to hosted checkout → payment provider sends a signed webhook → the API validates the signature → reservation state updates to `PAID` → emails dispatch via queue. This prevents any client-side manipulation of reservation status.

### BullMQ Job Queues
Three dedicated queues handle async workloads:
- **Mail queue** — email confirmation and verification, decoupled from the request cycle
- **Image queue** — property images upload asynchronously; the place is created immediately with a `PROCESSING` status and activated once uploads complete
- **Expiry queue** — a delayed job is scheduled at reservation creation; if unpaid after 10 minutes, the worker cancels the reservation and releases the time slot

### Redis Cache Strategy
Cache keys are scoped by resource type with different TTLs based on volatility:
- Place details and availability: 5 minutes (low change rate)
- Search/filter results: 60 seconds (high change rate due to dynamic filters)

A cache interceptor checks Redis before hitting the database. Cache is invalidated on mutations.

### Idempotency Keys
Critical write operations (checkout initiation, place creation, account deletion) require a client-provided idempotency key. The API stores processed keys in Redis with a short TTL, rejecting duplicate requests. This prevents double charges in unreliable network conditions.

### Multi-stage Docker Build
The production image uses a two-stage Dockerfile: a build stage compiles TypeScript, and a lean runtime stage copies only the compiled output and production dependencies. The final image size is significantly smaller than a single-stage build.

### Reservation State Machine

```
CREATED ──(10 min unpaid)──► EXPIRED
   │
   └──(webhook: payment confirmed)──► PAID
                                        │
                                        └──(owner/client action)──► CANCELLED
```

---

## Getting Started

### Option 1 — Docker Hub (recommended)

Pull the image and run it with your own `.env` file:

```bash
docker run -d \
  --name reservation-api \
  -p 4000:4000 \
  --env-file .env \
  dilkercp/place-reservations-api:latest
```

> PostgreSQL and Redis must be running and reachable before starting the container.

### Option 2 — Local Development with Docker Compose

```bash
# 1. Clone the repository
git clone https://github.com/Dilker15/reservation_system.git
cd place-reservations-api

# 2. Copy the environment file and fill in your credentials
cp .env.example .env

# 3. Start all services (API + PostgreSQL + Redis)
docker compose up -d
```

The API will be available at `http://localhost:4000`.

### Option 3 — Run without Docker

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment variables
cp .env.example .env

# 3. Start in development mode
npm run start:dev
```

> Requires Node.js 18+, a running PostgreSQL instance, and a running Redis instance.

---

## Environment Variables

See [`.env.example`](.env.example) for the full reference with descriptions.

| Group | Variables |
|---|---|
| Application | `APP_PORT`, `APP_URL`, `FRONT_END_URL` |
| Database | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` |
| Auth | `TOKEN_SECRET_KEY`, `EXPIRATION_TOKEN`, `SEED_TOKEN` |
| Mail | `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` |
| Redis | `REDIS_URL`, `REDIS_CACHE_URL` |
| Cloudinary | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CLIENT_ID` |
| Mercado Pago | `MERCADO_PAGO_KEY`, `MERCADO_PAGO_TOKEN`, `MERCADO_PAGO_WEBHOOK_SECRET`, `MERCADO_PAGO_CLIENT_ID`, `MERCADO_PAGO_CLIENT_SECRET` |
| Redirects | `BACK_URL_SUCCESS`, `BACK_URL_FAILURE`, `BACK_URL_PENDING` |

---

## API Documentation

The API is documented with Swagger / OpenAPI. Run the project locally and navigate to:

```
http://localhost:4000/api/docs
```


### Main endpoint groups

| Group | Description | Auth |
|---|---|---|
| `POST /auth/register` | Register as client or owner | Public |
| `POST /auth/login` | Authenticate and receive JWT | Public |
| `GET /places` | Browse and filter listings | Public |
| `POST /places` | Create a new property listing | `owner` |
| `GET /places/:id/availability` | Fetch available time slots | Public |
| `POST /reservations` | Create a reservation | `client` |
| `POST /payments/checkout` | Generate payment link | `client` |
| `POST /payments/webhook/STRIPE` | Stripe webhook receiver | Public (signature-validated) |
| `POST /payments/webhook/MERCADO_PAGO` | Mercado Pago webhook receiver | Public (signature-validated) |
| `GET /reservations/me` | View reservations | `client` | `owner` |
| `GET /analytics/dashboard` | Revenue and booking analytics | `owner` |

---

## CI/CD Pipeline

Every push to `main` triggers the following GitHub Actions workflow:

```
Push to main
     │
     ▼
Run unit tests (Jest) + generate coverage report
     │
     ├── FAIL → upload coverage report as GitHub Actions artifact
     │           (downloadable from the workflow run summary)
     │           pipeline stops, no deploy
     │
     ▼
Build Docker image (multi-stage)
     │
     ▼
Push image to Docker Hub
     │
     ▼
Push image to AWS ECR
     │
     ▼
Update ECS Task Definition with new image
     │
     ▼
Update ECS Service → rolling deployment on Fargate
```

> When tests fail, the coverage report (`coverage/`) is uploaded as a workflow artifact and remains available for download from the GitHub Actions run summary for 7 days.

---

## Author

**Dilker Cartagena**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dilker-cartagena-pedraza-1b2b4019b)
[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=flat-square&logo=netlify&logoColor=white)](https://funny-arithmetic-cb7e23.netlify.app/)
[![Docker Hub](https://img.shields.io/badge/Docker_Hub-2496ED?style=flat-square&logo=docker&logoColor=white)](https://hub.docker.com/r/dilkercp/place-reservations-api)