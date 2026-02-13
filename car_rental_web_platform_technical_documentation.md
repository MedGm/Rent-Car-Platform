# Car Rental Web Platform

## 1. Project Overview

This project is a **web-based car rental management platform** designed for a rental agency. The platform focuses on **availability-driven reservations** rather than online payments. Customers can browse cars, check real-time availability through calendar views, submit rental requests, and contact the agency directly via **WhatsApp integration**.

The system includes:

* A **public web application** for customers
* A **secure admin dashboard** for managing bookings, cars, contracts, and invoices
* A **mobile-first responsive design**

Payments are intentionally excluded in the first version to reduce friction and operational complexity.

---

## 2. Core Functional Goals

* Display cars with accurate availability
* Prevent double-bookings using date overlap logic
* Allow customers to submit rental requests (not instant confirmation)
* Provide per-car WhatsApp contact with pre-filled messages
* Enable admins to confirm, modify, or cancel rentals
* Generate rental contracts and invoices (PDF)
* Offer a calendar-based UX similar to airline availability systems

---

## 3. User Roles

### 3.1 Public User (Customer)

* Browse cars
* View car details and availability calendar
* Submit rental request forms
* Contact agency via WhatsApp

### 3.2 Admin User

* Manage cars and fleet availability
* Review and manage bookings
* Modify reservations upon customer request
* Generate contracts and invoices
* View calendar overview of fleet usage

---

## 4. Feature Specification

### 4.1 Public Web Application

#### 4.1.1 Home & Search

* Location selector
* Pickup & return date/time
* Featured cars
* Global WhatsApp contact CTA

#### 4.1.2 Car Listing Page

* Car card with:

  * Images
  * Key specs (seats, transmission, fuel)
  * Availability badge (Available / Partially Available / Fully Booked)
  * WhatsApp icon (per car)

#### 4.1.3 Car Detail Page

* Image gallery
* Full technical specs
* Rental conditions
* **Availability calendar**:

  * Available days
  * Booked days (disabled)
* "Request Rental" CTA
* WhatsApp contact with pre-filled message

#### 4.1.4 Availability Calendar Logic

* Backend-driven
* Blocks dates with confirmed bookings
* Shows next available date ranges when unavailable

#### 4.1.5 Rental Request Form

* Personal details
* Driver license information
* Requested dates
* Optional comments

Submission creates a **pending booking**.

---

### 4.2 Admin Dashboard

#### 4.2.1 Dashboard Overview

* Total bookings (by status)
* Upcoming rentals
* Fleet utilization

#### 4.2.2 Booking Management

* View all booking requests
* Filter by status/date/car
* Actions:

  * Confirm
  * Modify dates or car
  * Cancel

#### 4.2.3 Fleet Management

* Add/edit/delete cars
* Upload images
* Define unavailable periods (maintenance)

#### 4.2.4 Calendar View

* Global fleet calendar
* Visual timeline per car
* Conflict detection

#### 4.2.5 Contract & Invoice Generation

* Auto-generate PDF contract upon confirmation
* Generate invoice/facturation PDF
* Store documents linked to booking

---

## 5. Technical Stack

### 5.1 Frontend

* **Next.js**
* Server-side rendering (SEO & performance)
* Responsive mobile-first design
* API consumption via REST
* Color used : #ffffff #ff0000 #000000
### 5.2 Backend

* **Flask** (REST API)
* JWT-based admin authentication
* Business logic for availability & booking lifecycle

### 5.3 Database

* **PostgreSQL**
* Relational schema optimized for bookings & availability

---

## 6. Database Schema (Initial)

### users

* id
* name
* email
* phone
* driver_license_info

### cars

* id
* name
* category
* specs (JSON)
* images
* is_active

### bookings

* id
* user_id
* car_id
* start_date
* end_date
* status (pending, confirmed, modified, cancelled)
* created_at

### calendar_blocks

* id
* car_id
* start_date
* end_date
* reason (booking / maintenance)

### contracts

* id
* booking_id
* pdf_path
* invoice_data

---

## 7. REST API Specification

### Public Endpoints

**GET /api/cars**
List cars with filters

**GET /api/cars/{id}**
Get car details

**GET /api/cars/{id}/availability**
Return availability calendar

**POST /api/bookings**
Create booking request

---

### Admin Endpoints (Protected)

**GET /api/admin/bookings**
List all bookings

**PATCH /api/admin/bookings/{id}**
Modify booking

**POST /api/admin/bookings/{id}/confirm**
Confirm booking

**POST /api/admin/contracts**
Generate contract & invoice

---

## 8. Deployment Strategy

### 8.1 Infrastructure

* Ubuntu VPS
* Nginx reverse proxy
* SSL via Let’s Encrypt

### 8.2 Services

* Next.js frontend (Node.js)
* Flask API (Gunicorn)
* PostgreSQL database

### 8.3 Process Management

* Docker Compose (recommended) or systemd
* Environment variables for secrets

### 8.4 Security

* HTTPS only
* SSH key authentication
* Firewall (UFW)
* Daily database backups

---

## 9. Non-Functional Requirements

* Mobile responsiveness
* High availability of booking data
* Conflict-free reservation logic
* Clear admin audit trail

---

## 10. Future Enhancements

* User accounts & login
* Email/SMS automation
* Online payments
* Multi-location support
* Subscription-based rentals
* PWA mobile install

---

## 11. Philosophy

This platform prioritizes **availability correctness, operational clarity, and human-in-the-loop validation** over premature automation. Every design choice assumes real-world constraints: delayed confirmations, customer negotiation via WhatsApp, and admin authority over final rental decisions.

---

## 12. Availability & Booking Engine (Deep Dive)

### 12.1 Booking State Machine

Bookings are modeled as a **finite state machine** to prevent ambiguity:

* `PENDING` → created by user form submission
* `CONFIRMED` → validated by admin, blocks availability
* `MODIFIED` → admin-adjusted dates/car
* `CANCELLED` → frees availability

Rules:

* Only `CONFIRMED` bookings block availability
* `PENDING` bookings do NOT block inventory
* Any `MODIFIED` booking re-runs availability checks

This mirrors airline ticket workflows where seats are blocked only after confirmation.

---

### 12.2 Availability Overlap Algorithm

For a given car and requested interval `[start_date, end_date)`:

Conflict exists if:

```
(existing.start < requested.end)
AND
(existing.end > requested.start)
```

Only rows where:

* `booking.status = CONFIRMED`
* OR `calendar_blocks.reason = MAINTENANCE`

are considered blockers.

This logic:

* Prevents partial overlaps
* Allows same-day checkout / check-in
* Is index-friendly in PostgreSQL

---

### 12.3 Availability Calendar Generation

Backend returns a **date map**, not raw bookings:

```
{
  "2026-03-01": "available",
  "2026-03-02": "booked",
  "2026-03-03": "booked",
  "2026-03-04": "available"
}
```

Frontend renders:

* Disabled dates for booked days
* Highlights contiguous available ranges
* Suggests nearest available window if unavailable

---

## 13. Admin Conflict Resolution Logic

When an admin:

* Changes dates
* Switches assigned car

System must:

1. Re-run availability check
2. If conflict exists → show blocking booking IDs
3. Require explicit admin override decision

This avoids silent double-booking.

---

## 14. WhatsApp Integration Design

### 14.1 Message Template Structure

Each car stores a template:

```
Hi, I’m interested in renting the {{car_name}}
From {{start_date}} to {{end_date}}
Booking reference: {{booking_id}}
```

Frontend generates:

```
https://wa.me/<phone>?text=<url_encoded_message>
```

This ensures:

* Context-aware conversations
* Traceability to bookings

---

## 15. Contract & Invoice Generation (Technical)

### 15.1 Contract Pipeline

Trigger: Admin confirms booking

Steps:

1. Fetch booking + user + car data
2. Render HTML template (Jinja2)
3. Convert to PDF (wkhtmltopdf or WeasyPrint)
4. Store PDF path in `contracts` table

Contracts are **immutable snapshots** of confirmed rentals.

---

### 15.2 Invoice Logic

Invoice includes:

* Rental duration (days)
* Daily price
* Optional fees
* Tax breakdown

Invoices are versioned to allow corrections without overwriting history.

---

## 16. Authentication & Authorization

### 16.1 Admin Auth

* JWT-based login
* Role: `ADMIN`
* Token stored in HTTP-only cookie

Protected routes:

* `/api/admin/*`

---

## 17. Frontend Architecture (Next.js)

### 17.1 Rendering Strategy

* SSR for car listings & detail pages (SEO)
* Client-side fetch for availability calendar

### 17.2 State Management

* Local state for date selection
* Server as source of truth for availability

No optimistic booking assumptions allowed.

---

## 18. Deployment Architecture (Concrete)

### 18.1 Docker Compose Structure

Services:

* `nginx`
* `frontend`
* `backend`
* `postgres`

Volumes:

* Postgres data
* Contract PDFs

---

### 18.2 Nginx Routing

* `/` → Next.js
* `/api` → Flask

Handles SSL termination.

---

## 19. Data Integrity & Constraints

PostgreSQL constraints:

* Index on `(car_id, start_date, end_date)`
* Foreign keys enforced
* Booking status ENUM

Critical operations wrapped in transactions.

---

## 20. Failure Scenarios & Safeguards

* Server crash → bookings safe in DB
* Admin error → audit logs preserved
* Partial availability → visually explained to user

No silent failures.

---

## 21. Scaling Strategy (When Needed)

* Read replicas for Postgres
* Redis for availability caching
* Separate admin service
* CDN for images

---

## 22. Design Principle Summary

* Availability is sacred
* Admin is final authority
* UX explains constraints clearly
* System favors correctness over speed

This prevents the most common car-rental failure: **trust loss due to double bookings**.
